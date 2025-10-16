import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useOrganization } from '../OrganizationContext';
import { getAuth } from 'firebase/auth';

const ManagementCenterRestore = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [managementCenterFeatures, setManagementCenterFeatures] = useState([]);
  const [managementCenterProject, setManagementCenterProject] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [foundBackups, setFoundBackups] = useState([]);

  const searchForDetailedSpecifications = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const detailedFeatures = [];
      

      // 1. Search current organization projects
      const projectsRef = collection(db, 'organizations', currentOrganization.id, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      
      for (const projectDoc of projectsSnapshot.docs) {
        const project = projectDoc.data();
        
        const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', projectDoc.id, 'features');
        const featuresSnapshot = await getDocs(featuresRef);
        
        featuresSnapshot.docs.forEach(featureDoc => {
          const feature = featureDoc.data();
          
          // Look for ANY feature with longer descriptions
          if (feature.desc && feature.desc.length > 150) {
            detailedFeatures.push({
              id: featureDoc.id,
              projectName: project.name,
              projectId: projectDoc.id,
              name: feature.name,
              description: feature.desc,
              userStory: feature.userStory,
              category: feature.category,
              fullFeature: feature,
              source: 'current_org'
            });
          }
        });
      }

      // 2. Search old user-based structure
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          // Check all old projects regardless of name
          const oldProjectsRef = collection(db, 'projects');
          const oldProjectsSnapshot = await getDocs(oldProjectsRef);
          
          for (const oldProjectDoc of oldProjectsSnapshot.docs) {
            const oldProject = oldProjectDoc.data();
            
            try {
              const oldFeaturesRef = collection(db, 'projects', oldProjectDoc.id, 'features');
              const oldFeaturesSnapshot = await getDocs(oldFeaturesRef);
              
              oldFeaturesSnapshot.docs.forEach(featureDoc => {
                const feature = featureDoc.data();
                
                if (feature.desc && feature.desc.length > 150) {
                  detailedFeatures.push({
                    id: featureDoc.id,
                    projectName: `${oldProject.name || 'Unknown'} (OLD)`,
                    projectId: oldProjectDoc.id,
                    name: feature.name,
                    description: feature.desc,
                    userStory: feature.userStory,
                    category: feature.category,
                    fullFeature: feature,
                    source: 'old_structure'
                  });
                }
              });
            } catch (error) {
            }
          }
        } catch (error) {
        }

        // 3. Check user direct features
        try {
          const userFeaturesRef = collection(db, 'users', user.uid, 'features');
          const userFeaturesSnapshot = await getDocs(userFeaturesRef);
          
          userFeaturesSnapshot.docs.forEach(featureDoc => {
            const feature = featureDoc.data();
            
            if (feature.desc && feature.desc.length > 150) {
              detailedFeatures.push({
                id: featureDoc.id,
                projectName: 'User Direct Features',
                name: feature.name,
                description: feature.desc,
                userStory: feature.userStory,
                category: feature.category,
                fullFeature: feature,
                source: 'user_direct'
              });
            }
          });
        } catch (error) {
        }
      }

      // 4. Search ALL possible backup collections
      const backupCollections = [
        'backup_features', 'features_backup', 'management_center_backup', 
        'project_backup', 'user_backup', 'features', 'all_features'
      ];
      
      for (const collectionName of backupCollections) {
        try {
          const backupRef = collection(db, collectionName);
          const backupSnapshot = await getDocs(backupRef);
          
          if (backupSnapshot.size > 0) {
            
            backupSnapshot.docs.forEach(featureDoc => {
              const feature = featureDoc.data();
              
              if (feature.desc && feature.desc.length > 150) {
                detailedFeatures.push({
                  id: featureDoc.id,
                  projectName: `BACKUP (${collectionName})`,
                  name: feature.name,
                  description: feature.desc,
                  userStory: feature.userStory,
                  category: feature.category,
                  fullFeature: feature,
                  source: 'backup'
                });
              }
            });
          }
        } catch (error) {
        }
      }

      // 5. Check for any features containing specific keywords from your example
      const searchKeywords = [
        'Search Input Field', 'center section of header', 'flex-1 flex justify-center',
        'max-w-md', 'Acceptance Criteria', 'Definition of Done', 'Props Interface',
        'SearchResult Interface', 'Technical Notes', 'mockSearchData', 'onClick triggers',
        'positioned in center', 'search functionality', 'real-time results'
      ];
      
      // Re-scan found features for keyword matches
      const keywordMatches = detailedFeatures.filter(feature => {
        return searchKeywords.some(keyword => 
          feature.description?.includes(keyword) || 
          feature.userStory?.includes(keyword)
        );
      });

      if (keywordMatches.length > 0) {
      }

      // Sort by description length (longest first)
      detailedFeatures.sort((a, b) => (b.description?.length || 0) - (a.description?.length || 0));

      setFoundBackups(detailedFeatures);
      
      if (detailedFeatures.length > 0) {
        detailedFeatures.slice(0, 5).forEach((f, i) => {
        });
      }
      
    } catch (error) {
      console.error('Error searching for detailed specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Original Management Center 2.0 feature descriptions from managementCenterRecovery.js
  const originalFeatureDescriptions = {
    "HIVE Update": "This is for CSS work required",
    "Keyboard shortcuts": "Accessibility and shortcuts",
    "Maps & Caches": "As a distributed systems administrator or data architect I want a comprehensive maps and caches management interface",
    "Developer Console": "As a developer, cluster administrator, or DevOps engineer I want an interactive command-line console",
    "Centralized logging": "Unified logging interface",
    "Global Search Functionality": "As a cluster administrator, operator, or system user I want a global search functionality in the hazelcast management center",
    "Cluster Members Performance Chart Bento Box": "As a cluster administrator or performance monitoring engineer I want an interactive bar chart showing cluster member performance metrics",
    "Alert escalation": "Alert escalation policies",
    "Responsive Charts - Re-charts Implementation": "As a cluster administrator or operations engineer I want responsive, interactive charts that adapt to different screen sizes",
    "Alert management system": "Comprehensive alert management",
    "JVM and OS information": "JVM and operating system details",
    "Operations Per Second Status Card": "As a cluster administrator or performance engineer I want a quick-view status card showing real-time operations per second",
    "AI Agnetic Assistant - EPIC": "As a cluster administrator, DevOps engineer, or system operator I want an intelligent AI assistant for management center operations",
    "Total Maps Status Card": "As a cluster administrator or data operations engineer I want a quick-view status card showing total maps count and statistics",
    "Heartbeat monitoring": "Monitor member heartbeats",
    "Time Travel Controls": "As a cluster administrator or performance analyst I want interactive time travel controls with timeline navigation",
    "Zero-downtime deployment": "Deploy without downtime",
    "Cluster Details Page": "As a cluster administrator, operations engineer, or infrastructure manager I want a comprehensive cluster details page",
    "Memory Usage Chart Bento Box": "As a cluster administrator or capacity planning engineer I want an interactive area chart showing memory usage patterns",
    "Member status tracking": "Track member states",
    "Health Check Bento Box": "As a cluster administrator or SRE engineer I want a comprehensive health check dashboard widget showing system health status",
    "CPU and memory monitoring": "Resource utilization monitoring",
    "Memory Utilization Table": "As a cluster administrator or infrastructure engineer I want a detailed memory utilization table showing per-member statistics",
    "Guided tours": "Interactive onboarding",
    "Alerts & Notifications": "As a cluster administrator, DevOps engineer, or operations manager I want a comprehensive alerts and notifications system",
    "Pipeline visualization": "Event processing visualization",
    "Third-party integration": "Monitoring system integration",
    "Cross-region replication": "Multi-region backup replication",
    "Map size tracking": "Track map sizes and entries",
    "Cache Hit Ratio Status Card": "As a cluster administrator or cache performance engineer I want a quick-view status card showing cache hit ratio statistics",
    "Business Intelligence": "As a business analyst, executive, or data-driven decision maker I want a comprehensive business intelligence dashboard",
    "Diagnostic Logging": "As a cluster administrator, support engineer, or DevOps operator I want a dynamic runtime diagnostic logging system",
    "Dark mode and themes": "Theme customization options",
    "Alert thresholds": "Configurable alert thresholds",
    "TTL and eviction policies": "Configure TTL and eviction",
    "Partition ownership details": "Show partition ownership",
    "Cluster Connections Page": "As a system administrator, DevOps engineer, or multi-environment manager I want a cluster connections management page",
    "Customizable layouts": "Customizable workspace layouts",
    "Real-time Monitoring Dashboard": "As a cluster administrator, DevOps engineer, or system operator I want a comprehensive monitoring dashboard with real-time metrics",
    "SQL Browser": "As a cluster administrator, developer, or data analyst I want an interactive SQL browser with query capabilities",
    "Connection count tracking": "Track active connections",
    "Real-time notifications": "Instant notifications",
    "Cache Operations Chart Bento Box": "As a cache administrator or performance monitoring engineer I want an interactive dual-line chart showing cache operations metrics",
    "Partition Distribution Bento Box": "As a cluster administrator or data distribution engineer I want a visual partition distribution map showing data distribution across cluster members",
    "Log filtering and search": "Advanced log search",
    "Rolling updates": "Rolling updates and rollback",
    "Capacity planning": "Scaling recommendations",
    "Cache Management": "As a cache administrator, performance engineer, or system operator I want a comprehensive cache management interface",
    "Backup verification": "Backup integrity verification",
    "Responsive mobile interface": "Mobile-friendly design",
    "Network Throughput Chart Bento Box": "As a network administrator or performance monitoring engineer I want an interactive dual-line chart showing network throughput metrics",
    "Hit/miss ratio analytics": "Cache hit/miss analytics",
    "System Logs": "As a cluster administrator, DevOps engineer, or system operator I want a comprehensive system logs viewer with filtering and search capabilities",
    "Member list view": "Detailed member information view",
    "Jet Pipeline Designer": "Visual pipeline design interface for Jet",
    "Cluster Members Page": "As a cluster administrator, infrastructure operator, or DevOps engineer I want a comprehensive cluster members management page",
    "Active Members Status Card": "As a cluster administrator or operations engineer I want a quick-view status card showing the count of active cluster members"
  };

  const checkManagementCenterFeatures = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      // Find Management Center 2.0 project
      const projectsRef = collection(db, 'organizations', currentOrganization.id, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);

      let mgmtProject = null;
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        if (projectData.name === 'Management Center 2.0') {
          mgmtProject = { id: projectDoc.id, ...projectData };
          break;
        }
      }

      if (!mgmtProject) {
        setManagementCenterFeatures([]);
        setManagementCenterProject(null);
        return;
      }

      setManagementCenterProject(mgmtProject);

      // Get features from Management Center 2.0
      const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', mgmtProject.id, 'features');
      const featuresSnapshot = await getDocs(featuresRef);

      const features = featuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setManagementCenterFeatures(features);

    } catch (error) {
      console.error('Error checking Management Center features:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreCompleteUserStories = async () => {
    if (!managementCenterProject || !currentOrganization?.id) return;

    setLoading(true);
    try {
      let restoredCount = 0;


      // If we have found detailed specifications, use those instead of the basic ones
      if (foundBackups.length > 0) {
        
        for (const detailedSpec of foundBackups) {
          
          // Try multiple matching strategies
          let mcFeature = null;
          
          // 1. Exact name match
          mcFeature = managementCenterFeatures.find(f => f.name === detailedSpec.name);
          
          if (!mcFeature) {
            // 2. Case insensitive exact match
            mcFeature = managementCenterFeatures.find(f => 
              f.name?.toLowerCase() === detailedSpec.name?.toLowerCase()
            );
          }
          
          if (!mcFeature) {
            // 3. Partial name match (either direction)
            mcFeature = managementCenterFeatures.find(f => 
              f.name?.toLowerCase().includes(detailedSpec.name?.toLowerCase()) ||
              detailedSpec.name?.toLowerCase().includes(f.name?.toLowerCase())
            );
          }
          
          if (!mcFeature) {
            // 4. Category + keyword match
            const keywords = detailedSpec.name?.toLowerCase().split(' ') || [];
            mcFeature = managementCenterFeatures.find(f => 
              f.category === detailedSpec.category &&
              keywords.some(keyword => f.name?.toLowerCase().includes(keyword))
            );
          }
          
          if (!mcFeature) {
            // 5. Look for similar functionality keywords
            const searchKeywords = ['search', 'global', 'functionality', 'input', 'field'];
            if (searchKeywords.some(keyword => detailedSpec.name?.toLowerCase().includes(keyword))) {
              mcFeature = managementCenterFeatures.find(f => 
                searchKeywords.some(keyword => f.name?.toLowerCase().includes(keyword))
              );
            }
          }
          
          
          if (mcFeature) {
            // Check if current description is shorter than the detailed one
            const currentLength = mcFeature.desc?.length || 0;
            const detailedLength = detailedSpec.description?.length || 0;
            
            
            if (detailedLength > currentLength) {
              try {
                const featureRef = doc(db, 'organizations', currentOrganization.id, 'projects', managementCenterProject.id, 'features', mcFeature.id);
                await updateDoc(featureRef, {
                  desc: detailedSpec.description,
                  userStory: detailedSpec.description,
                  updatedAt: new Date(),
                  restoredFrom: detailedSpec.source,
                  restoredAt: new Date()
                });

                restoredCount++;
              } catch (error) {
                console.error(`Error restoring ${mcFeature.name}:`, error);
              }
            } else {
            }
          }
        }
      } else {
        // Fallback to original descriptions if no detailed specs found
        
        for (const feature of managementCenterFeatures) {
          
          // Try exact match first with original descriptions
          let originalDescription = originalFeatureDescriptions[feature.name];
          
          // If no exact match, try partial matching
          if (!originalDescription) {
            const matchingKey = Object.keys(originalFeatureDescriptions).find(key => 
              key.toLowerCase().includes(feature.name.toLowerCase()) ||
              feature.name.toLowerCase().includes(key.toLowerCase())
            );
            if (matchingKey) {
              originalDescription = originalFeatureDescriptions[matchingKey];
            }
          }
          
          // Check if we need to restore (current description is missing, too short, or different from original)
          const shouldRestore = !feature.desc || 
                               feature.desc.length < 10 || 
                               (originalDescription && feature.desc !== originalDescription);
          
          
          if (shouldRestore && originalDescription) {
            // Update the feature with the original description
            const featureRef = doc(db, 'organizations', currentOrganization.id, 'projects', managementCenterProject.id, 'features', feature.id);
            await updateDoc(featureRef, {
              desc: originalDescription,
              userStory: originalDescription,
              updatedAt: new Date()
            });

            restoredCount++;
          } else if (!originalDescription) {
          }
        }
      }

      alert(`Successfully restored ${restoredCount} feature descriptions!`);
      await checkManagementCenterFeatures(); // Refresh the data
      
    } catch (error) {
      console.error('Error restoring descriptions:', error);
      alert(`Error restoring descriptions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      checkManagementCenterFeatures();
    }
  }, [currentOrganization]);

  if (!currentOrganization) {
    return (
      <Alert severity="warning">
        No organization selected. Please select an organization to check Management Center features.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Management Center 2.0 - Original Description Restoration
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This tool will restore the original feature descriptions for your Management Center 2.0 features from your specifications.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={checkManagementCenterFeatures}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
          sx={{ mr: 2 }}
        >
          {loading ? 'Checking...' : 'Check Current State'}
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={searchForDetailedSpecifications}
          disabled={loading}
          startIcon={<RestoreIcon />}
          sx={{ mr: 2 }}
        >
          Find My Detailed Specifications
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={restoreCompleteUserStories}
          disabled={loading || !managementCenterProject || managementCenterFeatures.length === 0}
          startIcon={<RestoreIcon />}
        >
          Restore Original Descriptions ({managementCenterFeatures.length})
        </Button>
      </Box>

      {!managementCenterProject ? (
        <Alert severity="warning">
          Management Center 2.0 project not found. Please ensure the project exists in your organization.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Detailed Specifications Found */}
          {foundBackups.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    🎯 Found Your Detailed Specifications! ({foundBackups.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    These appear to be your original detailed specifications with acceptance criteria:
                  </Typography>
                  
                  <List>
                    {foundBackups.map((feature, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Typography variant="h6">
                              {feature.name}
                            </Typography>
                            <Chip 
                              label={feature.projectName} 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${(feature.description || '').length} chars`} 
                              size="small" 
                              color="success"
                            />
                            {feature.description?.includes('Acceptance Criteria') && (
                              <Chip 
                                label="Has Acceptance Criteria" 
                                size="small" 
                                color="primary"
                              />
                            )}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Detailed Specification:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2, maxHeight: 400, overflow: 'auto' }}>
                              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                {feature.description}
                              </Typography>
                            </Paper>
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  // Copy to clipboard
                                  navigator.clipboard.writeText(feature.description);
                                  alert('Copied detailed specification to clipboard!');
                                }}
                              >
                                Copy Specification
                              </Button>
                              
                              {feature.source !== 'backup' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => {
                                    
                                    // Wrap in try-catch and make it async properly
                                    (async () => {
                                      try {
                                        // Restore this detailed spec to Management Center
                                        if (!managementCenterProject) {
                                          alert('❌ Management Center 2.0 project not found');
                                          return;
                                        }
                                        
                                        if (managementCenterFeatures.length === 0) {
                                          alert('❌ No features found in Management Center 2.0 project');
                                          return;
                                        }
                                        
                                        
                                        // Try multiple matching strategies
                                        let mcFeature = null;
                                        
                                        // 1. Exact name match
                                        mcFeature = managementCenterFeatures.find(f => 
                                          f.name === feature.name
                                        );
                                        
                                        if (!mcFeature) {
                                          // 2. Case insensitive exact match
                                          mcFeature = managementCenterFeatures.find(f => 
                                            f.name?.toLowerCase() === feature.name?.toLowerCase()
                                          );
                                        }
                                        
                                        if (!mcFeature) {
                                          // 3. Partial name match (either direction)
                                          mcFeature = managementCenterFeatures.find(f => 
                                            f.name?.toLowerCase().includes(feature.name?.toLowerCase()) ||
                                            feature.name?.toLowerCase().includes(f.name?.toLowerCase())
                                          );
                                        }
                                        
                                        if (!mcFeature) {
                                          // 4. Category + keyword match
                                          const keywords = feature.name?.toLowerCase().split(' ') || [];
                                          mcFeature = managementCenterFeatures.find(f => 
                                            f.category === feature.category &&
                                            keywords.some(keyword => f.name?.toLowerCase().includes(keyword))
                                          );
                                        }
                                        
                                        if (!mcFeature) {
                                          // 5. Ask user to select manually
                                          const choices = managementCenterFeatures.map((f, i) => `${i}: ${f.name}`).join('\n');
                                          const selectedIndex = prompt(
                                            `Could not auto-match "${feature.name}".\n\nPlease select the target feature:\n\n${choices}\n\nEnter the number (or cancel):`
                                          );
                                          
                                          if (selectedIndex !== null && !isNaN(selectedIndex)) {
                                            const index = parseInt(selectedIndex);
                                            if (index >= 0 && index < managementCenterFeatures.length) {
                                              mcFeature = managementCenterFeatures[index];
                                            }
                                          }
                                        }
                                        
                                        if (mcFeature) {
                                          
                                          const featureRef = doc(db, 'organizations', currentOrganization.id, 'projects', managementCenterProject.id, 'features', mcFeature.id);
                                          
                                          await updateDoc(featureRef, {
                                            desc: feature.description,
                                            userStory: feature.description,
                                            updatedAt: new Date(),
                                            restoredFrom: feature.source,
                                            restoredAt: new Date()
                                          });
                                          
                                          alert(`✅ Successfully restored detailed specification for "${mcFeature.name}"!\n\nOriginal length: ${feature.description?.length} characters`);
                                          
                                          // Refresh the data
                                          await checkManagementCenterFeatures();
                                          
                                        } else {
                                          alert(`❌ Could not find a matching feature in Management Center 2.0 for "${feature.name}"`);
                                        }
                                        
                                      } catch (error) {
                                        console.error('❌ RESTORE ERROR:', error);
                                        alert(`❌ Error restoring: ${error.message}`);
                                      }
                                    })();
                                  }}
                                >
                                  Restore to Management Center
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Current State */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Management Center 2.0 Features ({managementCenterFeatures.length})
                </Typography>
                
                {managementCenterFeatures.length === 0 ? (
                  <Alert severity="info">
                    No features found in Management Center 2.0 project.
                  </Alert>
                ) : (
                  <List>
                    {managementCenterFeatures.map((feature, index) => (
                      <Accordion key={feature.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Typography variant="h6">
                              {feature.name}
                            </Typography>
                            <Chip 
                              label={feature.category || 'No Category'} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${(feature.desc || '').length} chars`} 
                              size="small" 
                              color={feature.desc && feature.desc.length > 100 ? 'success' : 'error'}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Current Description/User Story:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                              <Typography variant="body2">
                                {feature.desc || feature.userStory || 'No description available'}
                              </Typography>
                            </Paper>
                            
                            {originalFeatureDescriptions[feature.name] && (
                              <>
                                <Typography variant="subtitle2" gutterBottom>
                                  Original Description Available:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                  <Typography variant="body2">
                                    {originalFeatureDescriptions[feature.name]}
                                  </Typography>
                                </Paper>
                              </>
                            )}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ManagementCenterRestore;
