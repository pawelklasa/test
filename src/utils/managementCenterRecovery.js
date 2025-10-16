import { collection, doc, setDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Management Center 2.0 features data based on your specifications
const managementCenterFeatures = [
  {
    name: "HIVE Update",
    desc: "This is for CSS work required",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "USER INTERFACE",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Keyboard shortcuts",
    desc: "Accessibility and shortcuts",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "USER EXPERIENCE",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Maps & Caches",
    desc: "As a distributed systems administrator or data architect I want a comprehensive maps and caches management interface",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DATA MANAGEMENT",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Developer Console",
    desc: "As a developer, cluster administrator, or DevOps engineer I want an interactive command-line console",
    impactScore: 53,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "DEVELOPER TOOLS",
    state: "Missing",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Centralized logging",
    desc: "Unified logging interface",
    impactScore: 57,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "ALERTING & LOGGING",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Global Search Functionality",
    desc: "As a cluster administrator, operator, or system user I want a global search functionality in the hazelcast management center",
    impactScore: 57,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "SEARCH & NAVIGATION",
    state: "Missing",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Cluster Members Performance Chart Bento Box",
    desc: "As a cluster administrator or performance monitoring engineer I want an interactive bar chart showing cluster member performance metrics",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Alert escalation",
    desc: "Alert escalation policies",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "ALERTING & LOGGING",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Responsive Charts - Re-charts Implementation",
    desc: "As a cluster administrator or operations engineer I want responsive, interactive charts that adapt to different screen sizes",
    impactScore: 87,
    workflowStatus: "Live in Prod",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "Live in Prod",
    quarter: "Q4 2026",
    size: "M",
    storyPoints: 5,
    goal: "Other"
  },
  {
    name: "Alert management system",
    desc: "Comprehensive alert management",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "ALERTING & LOGGING",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "JVM and OS information",
    desc: "JVM and operating system details",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Could-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Operations Per Second Status Card",
    desc: "As a cluster administrator or performance engineer I want a quick-view status card showing real-time operations per second",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "AI Agnetic Assistant - EPIC",
    desc: "As a cluster administrator, DevOps engineer, or system operator I want an intelligent AI assistant for management center operations",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "ARTIFICIAL INTELLIGENCE",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Total Maps Status Card",
    desc: "As a cluster administrator or data operations engineer I want a quick-view status card showing total maps count and statistics",
    impactScore: 87,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "Missing",
    quarter: "Q4 2026",
    size: "S",
    storyPoints: 5,
    goal: "Other"
  },
  {
    name: "Heartbeat monitoring",
    desc: "Monitor member heartbeats",
    impactScore: 67,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Time Travel Controls",
    desc: "As a cluster administrator or performance analyst I want interactive time travel controls with timeline navigation",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Could-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Zero-downtime deployment",
    desc: "Deploy without downtime",
    impactScore: 53,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DEPLOYMENT & OPERATIONS",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Cluster Details Page",
    desc: "As a cluster administrator, operations engineer, or infrastructure manager I want a comprehensive cluster details page",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "CLUSTER MANAGEMENT",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Memory Usage Chart Bento Box",
    desc: "As a cluster administrator or capacity planning engineer I want an interactive area chart showing memory usage patterns",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Member status tracking",
    desc: "Track member states",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Health Check Bento Box",
    desc: "As a cluster administrator or SRE engineer I want a comprehensive health check dashboard widget showing system health status",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "CPU and memory monitoring",
    desc: "Resource utilization monitoring",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Memory Utilization Table",
    desc: "As a cluster administrator or infrastructure engineer I want a detailed memory utilization table showing per-member statistics",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Guided tours",
    desc: "Interactive onboarding",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "USER EXPERIENCE",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Alerts & Notifications",
    desc: "As a cluster administrator, DevOps engineer, or operations manager I want a comprehensive alerts and notifications system",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "OBSERVABILITY",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Pipeline visualization",
    desc: "Event processing visualization",
    impactScore: 57,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "STREAMING & EVENTS",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Third-party integration",
    desc: "Monitoring system integration",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "INTEGRATION & APIs",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Cross-region replication",
    desc: "Multi-region backup replication",
    impactScore: 57,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "BACKUP & RECOVERY",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Map size tracking",
    desc: "Track map sizes and entries",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "DATA STRUCTURES",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Cache Hit Ratio Status Card",
    desc: "As a cluster administrator or cache performance engineer I want a quick-view status card showing cache hit ratio statistics",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Business Intelligence",
    desc: "As a business analyst, executive, or data-driven decision maker I want a comprehensive business intelligence dashboard",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Could-Have",
    category: "OBSERVABILITY",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Diagnostic Logging",
    desc: "As a cluster administrator, support engineer, or DevOps operator I want a dynamic runtime diagnostic logging system",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "OBSERVABILITY",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Dark mode and themes",
    desc: "Theme customization options",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Could-Have",
    category: "USER INTERFACE",
    state: "Missing",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Alert thresholds",
    desc: "Configurable alert thresholds",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "ALERTING & LOGGING",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "TTL and eviction policies",
    desc: "Configure TTL and eviction",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "DATA STRUCTURES",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Partition ownership details",
    desc: "Show partition ownership",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Cluster Connections Page",
    desc: "As a system administrator, DevOps engineer, or multi-environment manager I want a cluster connections management page",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "CLUSTER MANAGEMENT",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Customizable layouts",
    desc: "Customizable workspace layouts",
    impactScore: 53,
    workflowStatus: "Planning",
    moscow: "Could-Have",
    category: "USER EXPERIENCE",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Real-time Monitoring Dashboard",
    desc: "As a cluster administrator, DevOps engineer, or system operator I want a comprehensive monitoring dashboard with real-time metrics",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "OBSERVABILITY",
    state: "Missing",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "SQL Browser",
    desc: "As a cluster administrator, developer, or data analyst I want an interactive SQL browser with query capabilities",
    impactScore: 57,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DEVELOPER TOOLS",
    state: "Missing",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Connection count tracking",
    desc: "Track active connections",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Could-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Real-time notifications",
    desc: "Instant notifications",
    impactScore: 67,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "ALERTING & LOGGING",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Cache Operations Chart Bento Box",
    desc: "As a cache administrator or performance monitoring engineer I want an interactive dual-line chart showing cache operations metrics",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Partition Distribution Bento Box",
    desc: "As a cluster administrator or data distribution engineer I want a visual partition distribution map showing data distribution across cluster members",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Log filtering and search",
    desc: "Advanced log search",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "ALERTING & LOGGING",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Rolling updates",
    desc: "Rolling updates and rollback",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DEPLOYMENT & OPERATIONS",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Capacity planning",
    desc: "Scaling recommendations",
    impactScore: 57,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "PERFORMANCE OPTIMIZATION",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Cache Management",
    desc: "As a cache administrator, performance engineer, or system operator I want a comprehensive cache management interface",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DATA MANAGEMENT",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Backup verification",
    desc: "Backup integrity verification",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "BACKUP & RECOVERY",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Responsive mobile interface",
    desc: "Mobile-friendly design",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "USER EXPERIENCE",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Network Throughput Chart Bento Box",
    desc: "As a network administrator or performance monitoring engineer I want an interactive dual-line chart showing network throughput metrics",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Hit/miss ratio analytics",
    desc: "Cache hit/miss analytics",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Should-Have",
    category: "DATA STRUCTURES",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "System Logs",
    desc: "As a cluster administrator, DevOps engineer, or system operator I want a comprehensive system logs viewer with filtering and search capabilities",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "OBSERVABILITY",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Member list view",
    desc: "Detailed member information view",
    impactScore: 63,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "MEMBER MANAGEMENT",
    state: "Missing",
    quarter: "-",
    size: "-"
  },
  {
    name: "Jet Pipeline Designer",
    desc: "Visual pipeline design interface for Jet",
    impactScore: 60,
    workflowStatus: "Won't Do",
    moscow: "Could-Have",
    category: "DEVELOPER TOOLS",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Cluster Members Page",
    desc: "As a cluster administrator, infrastructure operator, or DevOps engineer I want a comprehensive cluster members management page",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "CLUSTER MANAGEMENT",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  },
  {
    name: "Active Members Status Card",
    desc: "As a cluster administrator or operations engineer I want a quick-view status card showing the count of active cluster members",
    impactScore: 60,
    workflowStatus: "Planning",
    moscow: "Must-Have",
    category: "DASHBOARD",
    state: "-",
    quarter: "-",
    size: "-",
    storyPoints: 5
  }
];

export const recreateManagementCenterFeatures = async (organizationId, projectId) => {
  console.log('🔄 Recreating Management Center 2.0 features...', { organizationId, projectId });
  
  try {
    let createdFeatures = 0;
    let skippedFeatures = 0;
    const creationLog = [];

    // Check if features already exist to avoid duplicates
    const existingFeaturesRef = collection(db, 'organizations', organizationId, 'projects', projectId, 'features');
    const existingSnapshot = await getDocs(existingFeaturesRef);
    const existingFeatureNames = new Set(existingSnapshot.docs.map(doc => doc.data().name));

    console.log(`📋 Found ${existingSnapshot.size} existing features in project`);

    // Create each feature
    for (const featureData of managementCenterFeatures) {
      try {
        if (existingFeatureNames.has(featureData.name)) {
          console.log(`ℹ️ Feature "${featureData.name}" already exists, skipping`);
          skippedFeatures++;
          creationLog.push(`ℹ️ Skipped "${featureData.name}" (already exists)`);
          continue;
        }

        // Add the feature to the nested structure
        const featuresRef = collection(db, 'organizations', organizationId, 'projects', projectId, 'features');
        await addDoc(featuresRef, {
          ...featureData,
          projectId: projectId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Add default values for required fields
          assignee: '',
          estimation: '',
          tags: []
        });

        createdFeatures++;
        console.log(`✅ Created feature: ${featureData.name}`);
        creationLog.push(`✅ Created "${featureData.name}"`);
        
      } catch (error) {
        console.error(`❌ Error creating feature ${featureData.name}:`, error);
        creationLog.push(`❌ Failed to create "${featureData.name}": ${error.message}`);
      }
    }
    
    const summary = {
      success: true,
      message: `Successfully recreated ${createdFeatures} Management Center 2.0 features`,
      createdFeatures,
      skippedFeatures,
      totalFeatures: managementCenterFeatures.length,
      creationLog
    };
    
    console.log('✅ Management Center features recreation completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('❌ Error during feature recreation:', error);
    throw error;
  }
};
