// SIMPLE CONSOLE SCRIPT TO POPULATE HAZELCAST FEATURES
// Copy and paste this entire script into your browser console while on the Gapple app

async function populateHazelcastFeatures() {
  console.log('🚀 Starting manual feature population...');
  
  try {
    // Get Firebase functions from the global scope
    const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore');
    
    // Find your Test project
    console.log('Looking for Test project...');
    const projectsSnapshot = await getDocs(collection(window.db, 'projects'));
    let testProjectId = null;
    
    projectsSnapshot.forEach(doc => {
      const project = doc.data();
      console.log('Found project:', project.name);
      if (project.name === 'Test') {
        testProjectId = doc.id;
        console.log('✅ Found Test project with ID:', testProjectId);
      }
    });
    
    if (!testProjectId) {
      console.error('❌ No Test project found. Available projects:');
      projectsSnapshot.forEach(doc => console.log(' -', doc.data().name));
      return;
    }
    
    // Define features to add
    const features = [
      // SEARCH & NAVIGATION
      { name: 'Global search functionality', category: 'SEARCH & NAVIGATION', desc: 'Real-time search across all data types', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
      { name: 'Multi-data type search', category: 'SEARCH & NAVIGATION', desc: 'Search clusters, members, maps, etc.', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
      { name: 'Quick result navigation', category: 'SEARCH & NAVIGATION', desc: 'Instant navigation to search results', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
      
      // CLUSTER MANAGEMENT  
      { name: 'Multi-cluster support', category: 'CLUSTER MANAGEMENT', desc: 'Manage multiple clusters seamlessly', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Expand to EMEA', workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
      { name: 'Cluster dashboard', category: 'CLUSTER MANAGEMENT', desc: 'Comprehensive cluster health overview', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
      { name: 'Real-time monitoring', category: 'CLUSTER MANAGEMENT', desc: 'Live cluster status monitoring', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
      
      // MEMBER MANAGEMENT
      { name: 'Member list view', category: 'MEMBER MANAGEMENT', desc: 'Detailed member information display', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
      { name: 'Member status tracking', category: 'MEMBER MANAGEMENT', desc: 'Track Active/Inactive/Suspect states', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
      
      // DATA STRUCTURES
      { name: 'Maps management', category: 'DATA STRUCTURES', desc: 'Comprehensive Hazelcast maps interface', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
      { name: 'Cache statistics', category: 'DATA STRUCTURES', desc: 'Detailed cache management and stats', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
      
      // DASHBOARD
      { name: 'Performance dashboards', category: 'DASHBOARD', desc: 'Real-time performance monitoring', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
      { name: 'Memory tracking', category: 'DASHBOARD', desc: 'Live memory usage charts', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
      
      // DEVELOPER TOOLS
      { name: 'SQL Browser', category: 'DEVELOPER TOOLS', desc: 'Interactive query execution interface', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
      { name: 'Developer Console', category: 'DEVELOPER TOOLS', desc: 'Terminal-style development interface', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', workflowStatus: 'Planning', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
      
      // ALERTING
      { name: 'Alert management', category: 'ALERTING & LOGGING', desc: 'Comprehensive alert system', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
      { name: 'Real-time notifications', category: 'ALERTING & LOGGING', desc: 'Live alert notification system', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 3, effortRequired: 3 }
    ];
    
    // Get unique categories
    const categories = [...new Set(features.map(f => f.category))];
    console.log('Categories to add:', categories);
    
    // Add categories first
    for (const categoryName of categories) {
      console.log(`Adding category: ${categoryName}`);
      const categoriesRef = collection(window.db, 'categories');
      const categoryQuery = query(categoriesRef, where('projectId', '==', testProjectId), where('name', '==', categoryName));
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (categorySnapshot.empty) {
        await addDoc(categoriesRef, {
          name: categoryName,
          projectId: testProjectId,
          createdAt: new Date()
        });
        console.log(`✅ Added category: ${categoryName}`);
      } else {
        console.log(`✅ Category already exists: ${categoryName}`);
      }
    }
    
    // Add features
    let added = 0;
    for (const feature of features) {
      console.log(`Adding feature: ${feature.name}`);
      const featuresRef = collection(window.db, 'features');
      await addDoc(featuresRef, {
        ...feature,
        projectId: testProjectId,
        createdAt: new Date()
      });
      console.log(`✅ Added: ${feature.name}`);
      added++;
    }
    
    console.log(`🎉 Successfully added ${added} features across ${categories.length} categories!`);
    alert(`Success! Added ${added} Hazelcast features. Refresh the page to see them.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error occurred. Check console for details.');
  }
}

// Run the function
populateHazelcastFeatures();
