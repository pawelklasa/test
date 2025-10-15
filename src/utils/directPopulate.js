import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Direct population script - run this once
const populateDirectly = async () => {
  console.log('🚀 Starting direct feature population...');
  
  // Find Test project
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('name', '==', 'Test'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.error('❌ Test project not found!');
    return;
  }
  
  const projectId = snapshot.docs[0].id;
  console.log(`✅ Found Test project with ID: ${projectId}`);
  
  // Categories and their features
  const categoriesAndFeatures = {
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
      }
    ]
  };
  
  // Add categories and features
  for (const [categoryName, features] of Object.entries(categoriesAndFeatures)) {
    console.log(`📁 Adding category: ${categoryName}`);
    
    // Add category if it doesn't exist
    const categoriesRef = collection(db, 'categories');
    const categoryQuery = query(categoriesRef, where('projectId', '==', projectId), where('name', '==', categoryName));
    const categorySnapshot = await getDocs(categoryQuery);
    
    if (categorySnapshot.empty) {
      await addDoc(categoriesRef, {
        name: categoryName,
        projectId: projectId,
        createdAt: new Date()
      });
      console.log(`✅ Added category: ${categoryName}`);
    }
    
    // Add features
    for (const feature of features) {
      try {
        const featuresRef = collection(db, 'features');
        await addDoc(featuresRef, {
          ...feature,
          category: categoryName,
          projectId: projectId,
          createdAt: new Date()
        });
        console.log(`✅ Added feature: ${feature.name}`);
      } catch (error) {
        console.error(`❌ Error adding feature ${feature.name}:`, error);
      }
    }
  }
  
  console.log('🎉 Completed populating features!');
};

// Export for use
export { populateDirectly };
