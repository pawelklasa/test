import { useEffect } from 'react';
import { useProject } from '../ProjectContext';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Component that auto-populates ALL 92 features
const AutoPopulate = () => {
  const { projects } = useProject();

  useEffect(() => {
    const populateAllFeatures = async () => {
      console.log('🚀 Checking if features need to be populated...');

      // Find target project
      let targetProject = projects.find(p => p.name === 'Test Project' || p.name === 'Test');
      if (!targetProject && projects.length > 0) {
        targetProject = projects[0];
        console.log('No Test project found, using first project:', targetProject.name);
      }
      
      if (!targetProject) {
        console.log('No projects found');
        return;
      }

      console.log('✅ Found project:', targetProject.name, 'ID:', targetProject.id);

      try {
        // First, check if features already exist for this project
        const featuresRef = collection(db, 'features');
        const existingFeaturesQuery = query(featuresRef, where('projectId', '==', targetProject.id));
        const existingSnapshot = await getDocs(existingFeaturesQuery);
        
        if (existingSnapshot.size > 0) {
          console.log(`✅ Project already has ${existingSnapshot.size} features. Skipping population.`);
          return;
        }
        
        console.log('📊 No existing features found. Starting population...');

        // All 19 categories
        const categories = [
          'SEARCH & NAVIGATION', 'CLUSTER MANAGEMENT', 'MEMBER MANAGEMENT', 'DATA STRUCTURES',
          'DASHBOARD', 'DEVELOPER TOOLS', 'ALERTING & LOGGING', 'SECURITY & ACCESS CONTROL',
          'BACKUP & RECOVERY', 'MONITORING & METRICS', 'CONFIGURATION MANAGEMENT', 
          'PERFORMANCE OPTIMIZATION', 'NETWORKING & COMMUNICATION', 'INTEGRATION & APIs',
          'USER EXPERIENCE', 'DOCUMENTATION & HELP', 'TESTING & VALIDATION', 
          'DEPLOYMENT & OPERATIONS', 'STREAMING & EVENTS'
        ];

        // All 92 features (simplified for reliability)
      const allFeatures = [
        // SEARCH & NAVIGATION (4)
        { name: 'Global search functionality', category: 'SEARCH & NAVIGATION', desc: 'Comprehensive search across all data types', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Multi-data type search', category: 'SEARCH & NAVIGATION', desc: 'Search clusters, members, maps', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Quick navigation to results', category: 'SEARCH & NAVIGATION', desc: 'Instant navigation from search results', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Breadcrumb navigation', category: 'SEARCH & NAVIGATION', desc: 'Breadcrumb navigation support', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },

        // CLUSTER MANAGEMENT (6)
        { name: 'Multi-cluster support', category: 'CLUSTER MANAGEMENT', desc: 'Manage multiple clusters seamlessly', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
        { name: 'Cluster overview dashboard', category: 'CLUSTER MANAGEMENT', desc: 'Comprehensive cluster health dashboard', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
        { name: 'Cluster connection management', category: 'CLUSTER MANAGEMENT', desc: 'Manage cluster connections', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Environment support', category: 'CLUSTER MANAGEMENT', desc: 'Production/Staging/Development environments', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
        { name: 'WAN Replication', category: 'CLUSTER MANAGEMENT', desc: 'WAN replication configuration', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 5, effortRequired: 5 },
        { name: 'Real-time status monitoring', category: 'CLUSTER MANAGEMENT', desc: 'Live cluster status monitoring', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },

        // MEMBER MANAGEMENT (7)
        { name: 'Member list view', category: 'MEMBER MANAGEMENT', desc: 'Detailed member information view', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Member status tracking', category: 'MEMBER MANAGEMENT', desc: 'Track member states', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'CPU and memory monitoring', category: 'MEMBER MANAGEMENT', desc: 'Resource utilization monitoring', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Heartbeat monitoring', category: 'MEMBER MANAGEMENT', desc: 'Monitor member heartbeats', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
        { name: 'JVM and OS information', category: 'MEMBER MANAGEMENT', desc: 'JVM and operating system details', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Connection count tracking', category: 'MEMBER MANAGEMENT', desc: 'Track active connections', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Partition ownership details', category: 'MEMBER MANAGEMENT', desc: 'Show partition ownership', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },

        // DATA STRUCTURES (6)
        { name: 'Maps management', category: 'DATA STRUCTURES', desc: 'Comprehensive maps management', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Cache management', category: 'DATA STRUCTURES', desc: 'Cache statistics and management', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Map size tracking', category: 'DATA STRUCTURES', desc: 'Track map sizes and entries', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'TTL and eviction policies', category: 'DATA STRUCTURES', desc: 'Configure TTL and eviction', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Hit/miss ratio analytics', category: 'DATA STRUCTURES', desc: 'Cache hit/miss analytics', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Permissions management', category: 'DATA STRUCTURES', desc: 'Access permissions management', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

        // DASHBOARD (8)
        { name: 'Real-time performance dashboards', category: 'DASHBOARD', desc: 'Live performance monitoring', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Memory utilization tracking', category: 'DASHBOARD', desc: 'Memory usage charts', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Network throughput monitoring', category: 'DASHBOARD', desc: 'Network performance monitoring', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Cache operations analytics', category: 'DASHBOARD', desc: 'Cache operations analysis', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Responsive charts', category: 'DASHBOARD', desc: 'Interactive responsive charts', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Expandable chart modals', category: 'DASHBOARD', desc: 'Detailed chart modals', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Clickable timestamps', category: 'DASHBOARD', desc: 'Interactive timestamps', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Animated charts', category: 'DASHBOARD', desc: 'Chart animations and transitions', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 3, effortRequired: 2 },

        // DEVELOPER TOOLS (5)
        { name: 'SQL Browser', category: 'DEVELOPER TOOLS', desc: 'SQL browser with syntax highlighting', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Query execution', category: 'DEVELOPER TOOLS', desc: 'Execute queries and display results', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Developer Console', category: 'DEVELOPER TOOLS', desc: 'Terminal-style console', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Script execution', category: 'DEVELOPER TOOLS', desc: 'Execute custom scripts', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Code completion', category: 'DEVELOPER TOOLS', desc: 'IntelliSense and code completion', moscow: 'Could-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 3 },

        // ALERTING & LOGGING (6)
        { name: 'Alert management system', category: 'ALERTING & LOGGING', desc: 'Comprehensive alert management', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Real-time notifications', category: 'ALERTING & LOGGING', desc: 'Instant notifications', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Alert thresholds', category: 'ALERTING & LOGGING', desc: 'Configurable alert thresholds', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Centralized logging', category: 'ALERTING & LOGGING', desc: 'Unified logging interface', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Log filtering and search', category: 'ALERTING & LOGGING', desc: 'Advanced log search', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Alert escalation', category: 'ALERTING & LOGGING', desc: 'Alert escalation policies', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },

        // SECURITY & ACCESS CONTROL (5)
        { name: 'Role-based access control', category: 'SECURITY & ACCESS CONTROL', desc: 'RBAC implementation', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
        { name: 'User authentication', category: 'SECURITY & ACCESS CONTROL', desc: 'Secure authentication system', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Audit trail', category: 'SECURITY & ACCESS CONTROL', desc: 'Security audit logging', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
        { name: 'IP whitelisting', category: 'SECURITY & ACCESS CONTROL', desc: 'Network access controls', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Session management', category: 'SECURITY & ACCESS CONTROL', desc: 'Session timeout controls', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },

        // BACKUP & RECOVERY (4)
        { name: 'Automated backup scheduling', category: 'BACKUP & RECOVERY', desc: 'Schedule automated backups', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Point-in-time recovery', category: 'BACKUP & RECOVERY', desc: 'Point-in-time recovery capabilities', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
        { name: 'Backup verification', category: 'BACKUP & RECOVERY', desc: 'Backup integrity verification', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Cross-region replication', category: 'BACKUP & RECOVERY', desc: 'Multi-region backup replication', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

        // MONITORING & METRICS (6)
        { name: 'Custom metrics dashboards', category: 'MONITORING & METRICS', desc: 'Create custom dashboards', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Historical trend analysis', category: 'MONITORING & METRICS', desc: 'Long-term trend analysis', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Performance benchmarks', category: 'MONITORING & METRICS', desc: 'Benchmark comparisons', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Predictive analytics', category: 'MONITORING & METRICS', desc: 'Performance forecasting', moscow: 'Could-Have', state: 'Missing', businessValue: 3, technicalComplexity: 5, effortRequired: 4 },
        { name: 'Metrics export', category: 'MONITORING & METRICS', desc: 'Export to external systems', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'SLA monitoring', category: 'MONITORING & METRICS', desc: 'Service level monitoring', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },

        // CONFIGURATION MANAGEMENT (5)
        { name: 'Configuration versioning', category: 'CONFIGURATION MANAGEMENT', desc: 'Track configuration changes', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Configuration templates', category: 'CONFIGURATION MANAGEMENT', desc: 'Predefined configuration templates', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Configuration validation', category: 'CONFIGURATION MANAGEMENT', desc: 'Validate configuration changes', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Environment-specific configs', category: 'CONFIGURATION MANAGEMENT', desc: 'Environment-specific configurations', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Configuration drift detection', category: 'CONFIGURATION MANAGEMENT', desc: 'Detect configuration drift', moscow: 'Could-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },

        // PERFORMANCE OPTIMIZATION (4)
        { name: 'Automated tuning recommendations', category: 'PERFORMANCE OPTIMIZATION', desc: 'AI-driven optimization recommendations', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 5, effortRequired: 4 },
        { name: 'Resource utilization optimization', category: 'PERFORMANCE OPTIMIZATION', desc: 'Optimize resource utilization', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Query performance analysis', category: 'PERFORMANCE OPTIMIZATION', desc: 'Analyze query performance', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 3 },
        { name: 'Capacity planning', category: 'PERFORMANCE OPTIMIZATION', desc: 'Scaling recommendations', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

        // NETWORKING & COMMUNICATION (3)
        { name: 'Network topology visualization', category: 'NETWORKING & COMMUNICATION', desc: 'Visual network topology', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Communication protocol monitoring', category: 'NETWORKING & COMMUNICATION', desc: 'Monitor inter-node communication', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Network partition detection', category: 'NETWORKING & COMMUNICATION', desc: 'Detect network partitions', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },

        // INTEGRATION & APIs (4)
        { name: 'REST API', category: 'INTEGRATION & APIs', desc: 'Comprehensive REST API', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Third-party integration', category: 'INTEGRATION & APIs', desc: 'Monitoring system integration', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Webhook notifications', category: 'INTEGRATION & APIs', desc: 'Event callbacks via webhooks', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'CLI tool', category: 'INTEGRATION & APIs', desc: 'Command-line interface', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },

        // USER EXPERIENCE (5)
        { name: 'Responsive mobile interface', category: 'USER EXPERIENCE', desc: 'Mobile-friendly design', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
        { name: 'Dark mode and themes', category: 'USER EXPERIENCE', desc: 'Theme customization options', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 3 },
        { name: 'Keyboard shortcuts', category: 'USER EXPERIENCE', desc: 'Accessibility and shortcuts', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Guided tours', category: 'USER EXPERIENCE', desc: 'Interactive onboarding', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Customizable layouts', category: 'USER EXPERIENCE', desc: 'Customizable workspace layouts', moscow: 'Could-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },

        // DOCUMENTATION & HELP (3)
        { name: 'Integrated help system', category: 'DOCUMENTATION & HELP', desc: 'Built-in help and documentation', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 2, effortRequired: 3 },
        { name: 'Context-sensitive help', category: 'DOCUMENTATION & HELP', desc: 'Contextual help tooltips', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Video tutorials', category: 'DOCUMENTATION & HELP', desc: 'Embedded video content', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 2, effortRequired: 3 },

        // TESTING & VALIDATION (3)
        { name: 'Automated health checks', category: 'TESTING & VALIDATION', desc: 'System health diagnostics', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Performance testing', category: 'TESTING & VALIDATION', desc: 'Load testing and simulation', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Pre-flight checks', category: 'TESTING & VALIDATION', desc: 'Configuration validation', moscow: 'Must-Have', state: 'Missing', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },

        // DEPLOYMENT & OPERATIONS (3)
        { name: 'Zero-downtime deployment', category: 'DEPLOYMENT & OPERATIONS', desc: 'Deploy without downtime', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
        { name: 'Rolling updates', category: 'DEPLOYMENT & OPERATIONS', desc: 'Rolling updates and rollback', moscow: 'Must-Have', state: 'Missing', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Pipeline integration', category: 'DEPLOYMENT & OPERATIONS', desc: 'CI/CD pipeline integration', moscow: 'Should-Have', state: 'Missing', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

        // STREAMING & EVENTS (4)
        { name: 'Event streaming dashboard', category: 'STREAMING & EVENTS', desc: 'Real-time event monitoring', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Pipeline visualization', category: 'STREAMING & EVENTS', desc: 'Event processing visualization', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 4, effortRequired: 3 },
        { name: 'Stream analytics', category: 'STREAMING & EVENTS', desc: 'Streaming data analytics', moscow: 'Should-Have', state: 'Missing', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Event replay tools', category: 'STREAMING & EVENTS', desc: 'Event debugging and replay', moscow: 'Could-Have', state: 'Missing', businessValue: 2, technicalComplexity: 4, effortRequired: 4 }
      ];

        console.log(`📊 Populating ${allFeatures.length} features across ${categories.length} categories`);
        
        // Create all categories
        for (const categoryName of categories) {
          const categoriesRef = collection(db, 'categories');
          const categoryQuery = query(categoriesRef, 
            where('projectId', '==', targetProject.id), 
            where('name', '==', categoryName)
          );
          const categorySnapshot = await getDocs(categoryQuery);
          
          if (categorySnapshot.empty) {
            await addDoc(categoriesRef, {
              name: categoryName,
              projectId: targetProject.id,
              createdAt: new Date()
            });
            console.log(`✅ Created category: ${categoryName}`);
          }
        }

        // Add all features
        let addedCount = 0;
        for (const feature of allFeatures) {
          const featuresRef = collection(db, 'features');
          await addDoc(featuresRef, {
            ...feature,
            projectId: targetProject.id,
            createdAt: new Date()
          });
          addedCount++;
          if (addedCount % 10 === 0) {
            console.log(`✅ Added ${addedCount}/${allFeatures.length} features...`);
          }
        }

        const mustHave = allFeatures.filter(f => f.moscow === 'Must-Have').length;
        const shouldHave = allFeatures.filter(f => f.moscow === 'Should-Have').length;
        const couldHave = allFeatures.filter(f => f.moscow === 'Could-Have').length;
        const highImpact = allFeatures.filter(f => f.businessValue >= 4).length;
        
        console.log(`🎉 SUCCESS! Added ALL ${addedCount} Hazelcast features!
        📈 Summary:
        - Total: ${addedCount}
        - Must-Have: ${mustHave}  
        - Should-Have: ${shouldHave}
        - Could-Have: ${couldHave}
        - High Impact: ${highImpact}`);
        
      } catch (error) {
        console.error('❌ Error:', error);
      }
    };

    if (projects.length > 0) {
      populateAllFeatures();
    }
  }, [projects]);

  return null;
};

export default AutoPopulate;
