// DIRECT FEATURE POPULATION SCRIPT
// Run this in your browser console on the Gapple app page

async function populateTestProject() {
  console.log('🚀 Starting feature population...');
  
  try {
    // Use the Firebase functions that are already loaded in your app
    const { collection, addDoc, getDocs, query, where } = window.firebase?.firestore || 
          await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    // Get all projects to find "Test Project"
    console.log('Looking for Test Project...');
    const projectsRef = collection(window.db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    let testProjectId = null;
    projectsSnapshot.forEach(doc => {
      const project = doc.data();
      console.log('Found project:', project.name);
      if (project.name === 'Test Project') {
        testProjectId = doc.id;
        console.log('✅ Found Test Project with ID:', testProjectId);
      }
    });
    
    if (!testProjectId) {
      console.error('❌ Test Project not found!');
      alert('Test Project not found! Make sure you have a project named "Test Project"');
      return;
    }
    
    // Categories to create
    const categories = [
      'SEARCH & NAVIGATION',
      'CLUSTER MANAGEMENT', 
      'MEMBER MANAGEMENT',
      'DATA STRUCTURES',
      'DASHBOARD',
      'DEVELOPER TOOLS',
      'ALERTING & LOGGING'
    ];
    
    // Create categories first
    console.log('Creating categories...');
    for (const categoryName of categories) {
      const categoriesRef = collection(window.db, 'categories');
      const categoryQuery = query(categoriesRef, 
        where('projectId', '==', testProjectId), 
        where('name', '==', categoryName)
      );
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (categorySnapshot.empty) {
        await addDoc(categoriesRef, {
          name: categoryName,
          projectId: testProjectId,
          createdAt: new Date()
        });
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        console.log(`✅ Category exists: ${categoryName}`);
      }
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
      const featuresRef = collection(window.db, 'features');
      await addDoc(featuresRef, {
        ...feature,
        projectId: testProjectId,
        createdAt: new Date()
      });
      console.log(`✅ Added: ${feature.name}`);
      added++;
    }
    
    console.log(`🎉 Successfully added ${added} features to Test Project!`);
    alert(`Success! Added ${added} Hazelcast features to your Test Project. Refresh the page to see them.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error: ' + error.message);
  }
}

// Run it
populateTestProject();
