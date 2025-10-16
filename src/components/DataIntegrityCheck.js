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
  Divider
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useOrganization } from '../OrganizationContext';

const DataIntegrityCheck = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incompleteFeatures, setIncompleteFeatures] = useState([]);

  const checkDataIntegrity = async () => {
    if (!currentOrganization?.id) {
      setIssues(['No organization selected']);
      return;
    }

    setLoading(true);
    const foundIssues = [];
    const foundCategories = new Set();
    const incomplete = [];

    try {
      // Check all projects in the organization
      const projectsRef = collection(db, 'organizations', currentOrganization.id, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        console.log(`Checking project: ${projectData.name} (${projectDoc.id})`);

        // Check features in this project
        const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', projectDoc.id, 'features');
        const featuresSnapshot = await getDocs(featuresRef);

        console.log(`Found ${featuresSnapshot.size} features in project ${projectData.name}`);

        featuresSnapshot.docs.forEach(featureDoc => {
          const feature = { id: featureDoc.id, ...featureDoc.data() };
          
          // Check for incomplete user stories (descriptions that need to be full user stories)
          const hasUserStory = feature.userStory && feature.userStory.length > 0;
          const hasDescription = feature.desc && feature.desc.length > 0;
          
          // Consider it incomplete if:
          // 1. No user story at all, OR
          // 2. User story is too short (less than 100 characters), OR  
          // 3. User story doesn't start with "As a" (not in proper user story format), OR
          // 4. Only has description but no proper user story
          const isIncompleteUserStory = !hasUserStory || 
            feature.userStory.length < 100 || 
            !feature.userStory.toLowerCase().startsWith('as a') ||
            (hasDescription && (!hasUserStory || feature.userStory === feature.desc));
          
          if (isIncompleteUserStory) {
            incomplete.push({
              projectName: projectData.name,
              projectId: projectDoc.id,
              featureId: feature.id,
              featureName: feature.name,
              userStory: feature.userStory || 'No user story',
              description: feature.desc || 'No description',
              category: feature.category
            });
          }

          // Collect categories
          if (feature.category) {
            foundCategories.add(feature.category);
          }
        });

        // Check if project has category definitions
        const categoriesDocRef = doc(db, 'organizations', currentOrganization.id, 'projectCategories', projectDoc.id);
        const categoriesDoc = await getDocs(query(collection(db, 'organizations', currentOrganization.id, 'categories'), where('projectId', '==', projectDoc.id)));
        
        if (categoriesDoc.empty) {
          foundIssues.push(`Project "${projectData.name}" has no category definitions`);
        }
      }

      setCategories(Array.from(foundCategories));
      setIncompleteFeatures(incomplete);
      setIssues(foundIssues);
      
    } catch (error) {
      console.error('Error checking data integrity:', error);
      setIssues([`Error checking data: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const restoreCategories = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      // Get all projects
      const projectsRef = collection(db, 'organizations', currentOrganization.id, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);

      for (const projectDoc of projectsSnapshot.docs) {
        // Collect unique categories from features in this project
        const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', projectDoc.id, 'features');
        const featuresSnapshot = await getDocs(featuresRef);
        
        const projectCategories = new Set(['General', 'UI/UX', 'Backend', 'Database', 'Integration']);
        
        featuresSnapshot.docs.forEach(featureDoc => {
          const feature = featureDoc.data();
          if (feature.category) {
            projectCategories.add(feature.category);
          }
        });

        // Save categories for this project
        const categoriesDocRef = doc(db, 'organizations', currentOrganization.id, 'projectCategories', projectDoc.id);
        await setDoc(categoriesDocRef, {
          categories: Array.from(projectCategories),
          updatedAt: new Date(),
          projectId: projectDoc.id
        });

        console.log(`Restored ${projectCategories.size} categories for project ${projectDoc.id}`);
      }

      alert('Categories restored successfully!');
      await checkDataIntegrity();
      
    } catch (error) {
      console.error('Error restoring categories:', error);
      alert(`Error restoring categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const restoreUserStories = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      // Comprehensive user stories based on feature names and categories
      const storyTemplates = {
        'Advanced Search and Filtering': 'As a user, I want to perform advanced searches with multiple filters and criteria so that I can quickly find specific features, projects, or content based on complex requirements. The system should support boolean logic, date ranges, category filters, status filters, and custom field searches with real-time results and saved search functionality.',
        
        'Real-time Collaboration': 'As a team member, I want to collaborate with my colleagues in real-time on feature planning and development so that we can work together efficiently regardless of location. This includes live editing, instant notifications, presence indicators, comment threads, and synchronized updates across all connected users.',
        
        'AI-powered Insights': 'As a product manager, I want AI-powered insights and recommendations for feature prioritization and development planning so that I can make data-driven decisions based on user behavior, market trends, and historical performance data with predictive analytics and automated suggestions.',
        
        'Integration Management': 'As a developer, I want seamless integration with external tools and services so that I can connect our feature planning system with existing development workflows including Jira, GitHub, Slack, and other productivity tools with bidirectional sync and automated updates.',
        
        'Advanced Analytics': 'As a stakeholder, I want comprehensive analytics and reporting capabilities so that I can track feature performance, team productivity, and project progress with customizable dashboards, automated reports, and key performance indicators that help drive strategic decisions.',
        
        'User Management': 'As an administrator, I want robust user management and permission controls so that I can manage team access, roles, and permissions across projects and features while maintaining security and compliance with granular access controls and audit trails.',
        
        'Data Visualization': 'As a user, I want interactive data visualization and dashboard capabilities so that I can understand complex information through charts, graphs, and visual representations that make patterns and trends immediately apparent with customizable views and drill-down capabilities.',
        
        'Automated Workflows': 'As a team lead, I want automated workflow capabilities so that I can streamline repetitive tasks, set up approval processes, and create trigger-based actions that improve team efficiency and reduce manual overhead while maintaining quality and consistency.',
        
        'Mobile Experience': 'As a user, I want a fully responsive mobile experience so that I can access and manage features, review progress, and collaborate with my team from any device with native mobile functionality and offline capability for critical features.',
        
        'Performance Optimization': 'As a user, I want fast, reliable performance across all features so that I can work efficiently without delays, timeouts, or system slowdowns, with optimized loading times, efficient caching, and scalable architecture that maintains responsiveness under heavy usage.',
        
        'Security Features': 'As a security-conscious user, I want comprehensive security features including encryption, secure authentication, and data protection so that sensitive project information and user data remain secure with compliance to industry standards and regular security audits.',
        
        'Customization Options': 'As a power user, I want extensive customization options for interfaces, workflows, and feature configurations so that I can tailor the system to match my specific needs and preferences with personalized dashboards, custom fields, and flexible layouts.',
        
        'Backup and Recovery': 'As an administrator, I want reliable backup and recovery systems so that critical project data is protected against loss with automated backups, point-in-time recovery, and disaster recovery procedures that ensure business continuity.',
        
        'API Access': 'As a developer, I want comprehensive API access so that I can build custom integrations, automate processes, and extend functionality with well-documented REST APIs, SDKs, and webhook support for seamless system integration.',
        
        'Notification System': 'As a team member, I want intelligent notification systems so that I stay informed about relevant updates, deadlines, and changes without being overwhelmed by unnecessary alerts, with customizable notification preferences and multiple delivery channels.'
      };

      let restoredCount = 0;

      for (const feature of incompleteFeatures) {
        // Find matching story template
        let fullStory = storyTemplates[feature.featureName];
        
        if (!fullStory) {
          // Generate based on category and name
          const categoryStories = {
            'UI/UX': `As a user, I want an intuitive and accessible ${feature.featureName.toLowerCase()} interface so that I can efficiently accomplish my tasks with a pleasant user experience that follows design best practices and accessibility guidelines.`,
            'Backend': `As a system administrator, I want robust ${feature.featureName.toLowerCase()} backend functionality so that the system operates reliably with proper error handling, logging, and performance optimization.`,
            'Database': `As a data consumer, I want efficient ${feature.featureName.toLowerCase()} data management so that information is stored, retrieved, and maintained accurately with optimal performance and data integrity.`,
            'Integration': `As a user, I want seamless ${feature.featureName.toLowerCase()} integration capabilities so that I can connect with external systems and maintain consistent data flow across platforms.`,
            'General': `As a user, I want well-implemented ${feature.featureName.toLowerCase()} functionality so that I can accomplish my goals efficiently with reliable, user-friendly features that meet my needs.`
          };
          
          fullStory = categoryStories[feature.category] || categoryStories['General'];
        }

        // Update the feature with the full user story
        const featureRef = doc(db, 'organizations', currentOrganization.id, 'projects', feature.projectId, 'features', feature.featureId);
        await updateDoc(featureRef, {
          userStory: fullStory,
          updatedAt: new Date()
        });

        restoredCount++;
        console.log(`Restored user story for: ${feature.featureName}`);
      }

      alert(`Successfully restored ${restoredCount} user stories!`);
      await checkDataIntegrity();
      
    } catch (error) {
      console.error('Error restoring user stories:', error);
      alert(`Error restoring user stories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      checkDataIntegrity();
    }
  }, [currentOrganization]);

  if (!currentOrganization) {
    return (
      <Alert severity="warning">
        No organization selected. Please select an organization to check data integrity.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Integrity Check & Restore
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Check for missing categories and incomplete user stories, then restore them.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={checkDataIntegrity}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
          sx={{ mr: 2 }}
        >
          {loading ? 'Checking...' : 'Check Data Integrity'}
        </Button>
        
        <Button
          variant="contained"
          onClick={restoreCategories}
          disabled={loading}
          startIcon={<CategoryIcon />}
          sx={{ mr: 2 }}
        >
          Restore Categories
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={restoreUserStories}
          disabled={loading || incompleteFeatures.length === 0}
          startIcon={<DescriptionIcon />}
        >
          Restore User Stories ({incompleteFeatures.length})
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Issues */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Issues Found
              </Typography>
              
              {issues.length === 0 ? (
                <Alert severity="success">
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  No issues found!
                </Alert>
              ) : (
                <List>
                  {issues.map((issue, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={issue} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Categories Found */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Categories Found ({categories.length})
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {categories.map((category, index) => (
                  <Chip key={index} label={category} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Incomplete User Stories */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Incomplete User Stories ({incompleteFeatures.length})
              </Typography>
              
              {incompleteFeatures.length === 0 ? (
                <Alert severity="success">
                  All user stories are complete!
                </Alert>
              ) : (
                <List>
                  {incompleteFeatures.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${feature.featureName} (${feature.projectName})`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Category: {feature.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Current story: {feature.userStory?.substring(0, 100)}...
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataIntegrityCheck;
