const admin = require('firebase-admin');

// Initialize with your project ID (no service account needed for this)
admin.initializeApp({
  projectId: 'test-login-5b7a2'
});

const db = admin.firestore();

async function addFeaturesToTestProject() {
  console.log('🚀 Adding features to Test Project...');
  
  try {
    // Find Test Project
    const projectsSnapshot = await db.collection('projects').where('name', '==', 'Test Project').get();
    if (projectsSnapshot.empty) {
      console.log('❌ Test Project not found!');
      return;
    }
    
    const testProjectId = projectsSnapshot.docs[0].id;
    console.log('✅ Found Test Project ID:', testProjectId);
    
    // Categories to add
    const categories = [
      'SEARCH & NAVIGATION',
      'CLUSTER MANAGEMENT', 
      'MEMBER MANAGEMENT',
      'DATA STRUCTURES',
      'DASHBOARD',
      'DEVELOPER TOOLS',
      'ALERTING & LOGGING'
    ];
    
    // Add categories first
    console.log('Adding categories...');
    for (const categoryName of categories) {
      await db.collection('categories').add({
        name: categoryName,
        projectId: testProjectId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added category: ${categoryName}`);
    }
    
    // Features to add
    const features = [
      {
        name: 'Global search functionality with real-time results',
        desc: 'Implement comprehensive search across all data types with instant results',
        category: 'SEARCH & NAVIGATION',
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
        category: 'SEARCH & NAVIGATION',
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
        name: 'Multi-cluster support and switching',
        desc: 'Enable users to manage multiple clusters and switch between them seamlessly',
        category: 'CLUSTER MANAGEMENT',
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
        category: 'CLUSTER MANAGEMENT',
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
        name: 'Member list view with detailed information',
        desc: 'Comprehensive view of all cluster members with detailed status',
        category: 'MEMBER MANAGEMENT',
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
        category: 'MEMBER MANAGEMENT',
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
        name: 'Maps management and monitoring',
        desc: 'Comprehensive management interface for Hazelcast maps',
        category: 'DATA STRUCTURES',
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
        category: 'DATA STRUCTURES',
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
        name: 'Real-time performance dashboards',
        desc: 'Live performance monitoring with real-time updates',
        category: 'DASHBOARD',
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
        category: 'DASHBOARD',
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
        name: 'SQL Browser with query execution',
        desc: 'Interactive SQL browser for database queries and exploration',
        category: 'DEVELOPER TOOLS',
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
        name: 'Developer Console',
        desc: 'Terminal-style interface for advanced development tasks',
        category: 'DEVELOPER TOOLS',
        moscow: 'Should-Have',
        targetQuarter: 'Q2 2026',
        tshirtSize: 'L',
        state: 'Missing',
        goal: 'Improve Onboarding',
        gapTypes: ['Technology/Tech Debt'],
        workflowStatus: 'Planning',
        businessValue: 3,
        technicalComplexity: 4,
        effortRequired: 4
      },
      {
        name: 'Alert management system',
        desc: 'Comprehensive alert configuration and management',
        category: 'ALERTING & LOGGING',
        moscow: 'Must-Have',
        targetQuarter: 'Q1 2026',
        tshirtSize: 'L',
        state: 'Missing',
        goal: 'Reduce Churn by 5%',
        gapTypes: ['Technology/Tech Debt'],
        workflowStatus: 'Planning',
        businessValue: 5,
        technicalComplexity: 4,
        effortRequired: 4
      },
      {
        name: 'Real-time alert notifications',
        desc: 'Live notification system for critical alerts and events',
        category: 'ALERTING & LOGGING',
        moscow: 'Must-Have',
        targetQuarter: 'Q1 2026',
        tshirtSize: 'M',
        state: 'Missing',
        goal: 'Reduce Churn by 5%',
        gapTypes: ['Technology/Tech Debt'],
        workflowStatus: 'Planning',
        businessValue: 5,
        technicalComplexity: 3,
        effortRequired: 3
      }
    ];
    
    // Add features
    console.log('Adding features...');
    let added = 0;
    for (const feature of features) {
      await db.collection('features').add({
        ...feature,
        projectId: testProjectId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added feature: ${feature.name}`);
      added++;
    }
    
    console.log(`🎉 Successfully added ${added} features and ${categories.length} categories to Test Project!`);
    console.log('Refresh your Gapple app to see the new features.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

addFeaturesToTestProject();
