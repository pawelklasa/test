import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Function to add a category if it doesn't exist
export const addCategoryIfNotExists = async (projectId, categoryName) => {
  try {
    console.log(`Checking/adding category: ${categoryName} for project ${projectId}`);
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('projectId', '==', projectId), where('name', '==', categoryName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(categoriesRef, {
        name: categoryName,
        projectId: projectId,
        createdAt: new Date()
      });
      console.log(`✅ Added category: ${categoryName}`);
    } else {
      console.log(`✅ Category already exists: ${categoryName}`);
    }
  } catch (error) {
    console.error(`❌ Error adding category ${categoryName}:`, error);
    throw error;
  }
};

// Function to add a feature
export const addFeatureToProject = async (projectId, featureData) => {
  try {
    console.log(`Adding feature: ${featureData.name} to project ${projectId}`);
    const featuresRef = collection(db, 'features');
    await addDoc(featuresRef, {
      ...featureData,
      projectId: projectId,
      createdAt: new Date()
    });
    console.log(`✅ Successfully added feature: ${featureData.name}`);
  } catch (error) {
    console.error(`❌ Error adding feature ${featureData.name}:`, error);
    throw error;
  }
};

// All features organized by category
export const hazelcastFeatures = {
  'SEARCH & NAVIGATION': [
    {
      name: 'Global search functionality with real-time results',
      desc: 'Implement comprehensive search across all data types with instant results',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 4,
      effortRequired: 4
    },
    {
      name: 'Search across multiple data types',
      desc: 'Enable search functionality across clusters, members, maps, and other data structures',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Quick navigation to search results',
      desc: 'Provide instant navigation from search results to relevant sections',
      moscow: 'Should-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 2,
      effortRequired: 2
    },
    {
      name: 'Breadcrumb navigation support',
      desc: 'Implement breadcrumb navigation for better user orientation',
      moscow: 'Could-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 2,
      technicalComplexity: 2,
      effortRequired: 2
    }
  ],
  'CLUSTER MANAGEMENT': [
    {
      name: 'Multi-cluster support and switching',
      desc: 'Enable users to manage multiple clusters and switch between them seamlessly',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'XL',
      state: 'Missing',
      goal: 'Expand to EMEA',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 5,
      technicalComplexity: 5,
      effortRequired: 5
    },
    {
      name: 'Cluster overview dashboard',
      desc: 'Comprehensive dashboard showing cluster health and status',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 4
    },
    {
      name: 'Cluster connection management',
      desc: 'Manage cluster connections with configuration and monitoring',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 4,
      effortRequired: 4
    },
    {
      name: 'Production/Staging/Development environments',
      desc: 'Support for different cluster environments with proper isolation',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Expand to EMEA',
      gapTypes: ['Process'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 4
    },
    {
      name: 'WAN Replication configuration',
      desc: 'Configure and monitor WAN replication between clusters',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'XL',
      state: 'Missing',
      goal: 'Expand to EMEA',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 5,
      effortRequired: 5
    },
    {
      name: 'Real-time cluster status monitoring',
      desc: 'Live monitoring of cluster health and performance metrics',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 5,
      technicalComplexity: 4,
      effortRequired: 4
    }
  ],
  'MEMBER MANAGEMENT': [
    {
      name: 'Member list view with detailed information',
      desc: 'Comprehensive view of all cluster members with detailed status',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Member status tracking',
      desc: 'Track member states: Active/Inactive/Suspect/Joining',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'CPU and memory usage per member',
      desc: 'Monitor resource utilization for each cluster member',
      moscow: 'Should-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Heartbeat monitoring',
      desc: 'Monitor member heartbeats and connection health',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 2,
      effortRequired: 2
    },
    {
      name: 'JVM and OS information',
      desc: 'Display JVM and operating system details for each member',
      moscow: 'Could-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Other',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 2,
      technicalComplexity: 2,
      effortRequired: 2
    },
    {
      name: 'Connection count tracking',
      desc: 'Track and display active connections per member',
      moscow: 'Could-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Other',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 2,
      technicalComplexity: 2,
      effortRequired: 2
    },
    {
      name: 'Partition ownership details',
      desc: 'Show which partitions are owned by each member',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 3,
      effortRequired: 3
    }
  ],
  'DATA STRUCTURES': [
    {
      name: 'Maps management and monitoring',
      desc: 'Comprehensive management interface for Hazelcast maps',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 5,
      technicalComplexity: 4,
      effortRequired: 4
    },
    {
      name: 'Cache management with statistics',
      desc: 'Detailed cache statistics and management capabilities',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 4,
      effortRequired: 4
    },
    {
      name: 'Map size and entry tracking',
      desc: 'Track map sizes, entry counts, and backup information',
      moscow: 'Should-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'TTL and eviction policy configuration',
      desc: 'Configure time-to-live and eviction policies for data structures',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Other',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Hit/miss ratio analytics',
      desc: 'Track and analyze cache hit/miss ratios for performance optimization',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Increase NPS',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Read/write permissions management',
      desc: 'Manage access permissions for data structures',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Other',
      gapTypes: ['Process'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 4,
      effortRequired: 4
    }
  ],
  'DASHBOARD': [
    {
      name: 'Real-time performance dashboards',
      desc: 'Live performance monitoring with real-time updates',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'L',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 5,
      technicalComplexity: 4,
      effortRequired: 4
    },
    {
      name: 'Memory utilization tracking',
      desc: 'Live charts showing memory usage across the cluster',
      moscow: 'Must-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Network throughput monitoring',
      desc: 'Monitor network performance and throughput metrics',
      moscow: 'Should-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Cache operations analytics',
      desc: 'Analyze cache operations and performance patterns',
      moscow: 'Should-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Increase NPS',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 4,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Responsive charts with tooltips',
      desc: 'Interactive charts with rollover tooltips and responsive design',
      moscow: 'Should-Have',
      targetQuarter: 'Q1 2026',
      tshirtSize: 'M',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 3,
      technicalComplexity: 3,
      effortRequired: 3
    },
    {
      name: 'Expandable chart modals',
      desc: 'Modal dialogs for detailed chart analysis and expanded view',
      moscow: 'Could-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 2,
      technicalComplexity: 2,
      effortRequired: 2
    },
    {
      name: 'Clickable timestamps',
      desc: 'Enable users to click on timestamps for detailed data exploration',
      moscow: 'Could-Have',
      targetQuarter: 'Q2 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Improve Onboarding',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 2,
      technicalComplexity: 2,
      effortRequired: 2
    },
    {
      name: 'Animated charts with transitions',
      desc: 'Smooth chart animations with configurable duration and easing',
      moscow: 'Could-Have',
      targetQuarter: 'Q3 2026',
      tshirtSize: 'S',
      state: 'Missing',
      goal: 'Increase NPS',
      gapTypes: ['Technology/Tech Debt'],
      workflowStatus: 'Planning',
      businessValue: 2,
      technicalComplexity: 3,
      effortRequired: 2
    }
  ]
};

// Function to populate all features
export const populateHazelcastFeatures = async (projectId) => {
  console.log('🚀 Starting to populate Hazelcast features for project:', projectId);
  
  try {
    for (const [categoryName, features] of Object.entries(hazelcastFeatures)) {
      console.log(`📁 Processing category: ${categoryName} with ${features.length} features`);
      await addCategoryIfNotExists(projectId, categoryName);
      
      for (const feature of features) {
        await addFeatureToProject(projectId, {
          ...feature,
          category: categoryName
        });
      }
      console.log(`✅ Completed category: ${categoryName}`);
    }
    
    console.log('🎉 Finished populating Hazelcast features!');
  } catch (error) {
    console.error('❌ Error in populateHazelcastFeatures:', error);
    throw error;
  }
};
