// Complete feature population script - paste this in browser console
// Run this on your Gapple app page to populate all Hazelcast features

const populateHazelcastFeatures = async () => {
  // Import Firebase functions from global scope (they should be available in your app)
  const { collection, addDoc, getDocs, query, where } = window.firebase.firestore;
  const db = window.db; // Your Firebase db instance
  
  console.log('🚀 Starting Hazelcast feature population...');
  
  try {
    // Find Test project
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('name', '==', 'Test'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('❌ Test project not found!');
      alert('Test project not found! Make sure you have a project named "Test"');
      return;
    }
    
    const projectId = snapshot.docs[0].id;
    console.log(`✅ Found Test project with ID: ${projectId}`);
    
    // All categories and features
    const allFeatures = {
      'SEARCH & NAVIGATION': [
        { name: 'Global search functionality with real-time results', desc: 'Implement comprehensive search across all data types with instant results', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Search across multiple data types', desc: 'Enable search functionality across clusters, members, maps, and other data structures', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Quick navigation to search results', desc: 'Provide instant navigation from search results to relevant sections', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
        { name: 'Breadcrumb navigation support', desc: 'Implement breadcrumb navigation for better user orientation', moscow: 'Could-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 2, technicalComplexity: 2, effortRequired: 2 }
      ],
      'CLUSTER MANAGEMENT': [
        { name: 'Multi-cluster support and switching', desc: 'Enable users to manage multiple clusters and switch between them seamlessly', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Expand to EMEA', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
        { name: 'Cluster overview dashboard', desc: 'Comprehensive dashboard showing cluster health and status', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
        { name: 'Cluster connection management', desc: 'Manage cluster connections with configuration and monitoring', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
        { name: 'Production/Staging/Development environments', desc: 'Support for different cluster environments with proper isolation', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Expand to EMEA', gapTypes: ['Process'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
        { name: 'WAN Replication configuration', desc: 'Configure and monitor WAN replication between clusters', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Expand to EMEA', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 5, effortRequired: 5 },
        { name: 'Real-time cluster status monitoring', desc: 'Live monitoring of cluster health and performance metrics', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 5, technicalComplexity: 4, effortRequired: 4 }
      ],
      'MEMBER MANAGEMENT': [
        { name: 'Member list view with detailed information', desc: 'Comprehensive view of all cluster members with detailed status', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'Member status tracking', desc: 'Track member states: Active/Inactive/Suspect/Joining', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
        { name: 'CPU and memory usage per member', desc: 'Monitor resource utilization for each cluster member', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', gapTypes: ['Technology/Tech Debt'], workflowStatus: 'Planning', businessValue: 3, technicalComplexity: 3, effortRequired: 3 }
      ]
    };
    
    let totalAdded = 0;
    
    // Add each category and its features
    for (const [categoryName, features] of Object.entries(allFeatures)) {
      console.log(`📁 Processing category: ${categoryName}`);
      
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
          totalAdded++;
        } catch (error) {
          console.error(`❌ Error adding feature ${feature.name}:`, error);
        }
      }
    }
    
    console.log(`🎉 Successfully added ${totalAdded} features across ${Object.keys(allFeatures).length} categories!`);
    alert(`Success! Added ${totalAdded} Hazelcast features to your Test project. Refresh the page to see them.`);
    
  } catch (error) {
    console.error('❌ Error during population:', error);
    alert('Error occurred during population. Check console for details.');
  }
};

// Run the function
populateHazelcastFeatures();
