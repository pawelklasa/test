// Direct population script - run this in browser console
// This will add ALL 92 Hazelcast features across 19 categories

async function populateAllFeatures() {
  const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../firebase');

  // Find the project
  const projectsSnapshot = await getDocs(collection(db, 'projects'));
  let projectId = null;
  
  projectsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.name === 'Test Project' || data.name === 'Test') {
      projectId = doc.id;
      console.log('Found project:', data.name, 'ID:', doc.id);
    }
  });

  if (!projectId) {
    // Use first project if no Test project found
    if (projectsSnapshot.docs.length > 0) {
      projectId = projectsSnapshot.docs[0].id;
      console.log('Using first project:', projectsSnapshot.docs[0].data().name);
    } else {
      console.error('No projects found!');
      return;
    }
  }

  // All categories
  const categories = [
    'SEARCH & NAVIGATION',
    'CLUSTER MANAGEMENT',
    'MEMBER MANAGEMENT', 
    'DATA STRUCTURES',
    'DASHBOARD',
    'DEVELOPER TOOLS',
    'ALERTING & LOGGING',
    'SECURITY & ACCESS CONTROL',
    'BACKUP & RECOVERY',
    'MONITORING & METRICS',
    'CONFIGURATION MANAGEMENT',
    'PERFORMANCE OPTIMIZATION',
    'NETWORKING & COMMUNICATION',
    'INTEGRATION & APIs',
    'USER EXPERIENCE',
    'DOCUMENTATION & HELP',
    'TESTING & VALIDATION',
    'DEPLOYMENT & OPERATIONS',
    'STREAMING & EVENTS'
  ];

  // All 92 features
  const allFeatures = [
    // SEARCH & NAVIGATION (4 features)
    { name: 'Global search functionality with real-time results', category: 'SEARCH & NAVIGATION', desc: 'Implement comprehensive search across all data types with instant results', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Search across multiple data types', category: 'SEARCH & NAVIGATION', desc: 'Enable search functionality across clusters, members, maps, and other data structures', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Quick navigation to search results', category: 'SEARCH & NAVIGATION', desc: 'Provide instant navigation from search results to relevant sections', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
    { name: 'Breadcrumb navigation support', category: 'SEARCH & NAVIGATION', desc: 'Implement breadcrumb navigation for better user orientation', moscow: 'Could-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },

    // CLUSTER MANAGEMENT (6 features)
    { name: 'Multi-cluster support and switching', category: 'CLUSTER MANAGEMENT', desc: 'Enable users to manage multiple clusters and switch between them seamlessly', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Expand to EMEA', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
    { name: 'Cluster overview dashboard', category: 'CLUSTER MANAGEMENT', desc: 'Comprehensive dashboard showing cluster health and status', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
    { name: 'Cluster connection management', category: 'CLUSTER MANAGEMENT', desc: 'Manage cluster connections with configuration and monitoring', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Production/Staging/Development environments', category: 'CLUSTER MANAGEMENT', desc: 'Support for different cluster environments with proper isolation', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Expand to EMEA', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
    { name: 'WAN Replication configuration', category: 'CLUSTER MANAGEMENT', desc: 'Configure and monitor WAN replication between clusters', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Expand to EMEA', businessValue: 4, technicalComplexity: 5, effortRequired: 5 },
    { name: 'Real-time cluster status monitoring', category: 'CLUSTER MANAGEMENT', desc: 'Live monitoring of cluster health and performance metrics', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },

    // MEMBER MANAGEMENT (7 features)
    { name: 'Member list view with detailed information', category: 'MEMBER MANAGEMENT', desc: 'Comprehensive view of all cluster members with detailed status', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Member status tracking', category: 'MEMBER MANAGEMENT', desc: 'Track member states: Active/Inactive/Suspect/Joining', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'CPU and memory usage per member', category: 'MEMBER MANAGEMENT', desc: 'Monitor resource utilization for each cluster member', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Heartbeat monitoring', category: 'MEMBER MANAGEMENT', desc: 'Monitor member heartbeats and connection health', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
    { name: 'JVM and OS information', category: 'MEMBER MANAGEMENT', desc: 'Display JVM and operating system details for each member', moscow: 'Could-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Other', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
    { name: 'Connection count tracking', category: 'MEMBER MANAGEMENT', desc: 'Track and display active connections per member', moscow: 'Could-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Other', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
    { name: 'Partition ownership details', category: 'MEMBER MANAGEMENT', desc: 'Show which partitions are owned by each member', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },

    // DATA STRUCTURES (6 features)
    { name: 'Maps management and monitoring', category: 'DATA STRUCTURES', desc: 'Comprehensive management interface for Hazelcast maps', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Cache management with statistics', category: 'DATA STRUCTURES', desc: 'Detailed cache statistics and management capabilities', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Map size and entry tracking', category: 'DATA STRUCTURES', desc: 'Track map sizes, entry counts, and backup information', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'TTL and eviction policy configuration', category: 'DATA STRUCTURES', desc: 'Configure time-to-live and eviction policies for data structures', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Hit/miss ratio analytics', category: 'DATA STRUCTURES', desc: 'Track and analyze cache hit/miss ratios for performance optimization', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Read/write permissions management', category: 'DATA STRUCTURES', desc: 'Manage access permissions for data structures', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

    // DASHBOARD (8 features)
    { name: 'Real-time performance dashboards', category: 'DASHBOARD', desc: 'Live performance monitoring with real-time updates', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Memory utilization tracking', category: 'DASHBOARD', desc: 'Live charts showing memory usage across the cluster', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Network throughput monitoring', category: 'DASHBOARD', desc: 'Monitor network performance and throughput metrics', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Cache operations analytics', category: 'DASHBOARD', desc: 'Analyze cache operations and performance patterns', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Responsive charts with tooltips', category: 'DASHBOARD', desc: 'Interactive charts with rollover tooltips and responsive design', moscow: 'Should-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Expandable chart modals', category: 'DASHBOARD', desc: 'Modal dialogs for detailed chart analysis and expanded view', moscow: 'Could-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
    { name: 'Clickable timestamps', category: 'DASHBOARD', desc: 'Enable users to click on timestamps for detailed data exploration', moscow: 'Could-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', businessValue: 2, technicalComplexity: 2, effortRequired: 2 },
    { name: 'Animated charts with transitions', category: 'DASHBOARD', desc: 'Smooth chart animations with configurable duration and easing', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'S', state: 'Missing', goal: 'Increase NPS', businessValue: 2, technicalComplexity: 3, effortRequired: 2 },

    // DEVELOPER TOOLS (5 features)  
    { name: 'SQL Browser with syntax highlighting', category: 'DEVELOPER TOOLS', desc: 'Interactive SQL query browser with advanced syntax highlighting', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Query execution and results display', category: 'DEVELOPER TOOLS', desc: 'Execute SQL queries and display formatted results', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Developer Console with terminal interface', category: 'DEVELOPER TOOLS', desc: 'Terminal-style console for advanced cluster operations', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Script execution environment', category: 'DEVELOPER TOOLS', desc: 'Environment for executing custom scripts and commands', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Code completion and IntelliSense', category: 'DEVELOPER TOOLS', desc: 'Intelligent code completion for SQL and scripting', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 3, technicalComplexity: 4, effortRequired: 3 },

    // ALERTING & LOGGING (6 features)
    { name: 'Comprehensive alert management system', category: 'ALERTING & LOGGING', desc: 'Create, manage, and configure alerts for various cluster conditions', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Real-time notification delivery', category: 'ALERTING & LOGGING', desc: 'Instant alert notifications via email, SMS, and in-app', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Alert threshold configuration', category: 'ALERTING & LOGGING', desc: 'Configurable thresholds for performance and health metrics', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Centralized logging interface', category: 'ALERTING & LOGGING', desc: 'Unified interface for viewing and searching cluster logs', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Log filtering and search capabilities', category: 'ALERTING & LOGGING', desc: 'Advanced filtering and full-text search across all logs', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Alert escalation policies', category: 'ALERTING & LOGGING', desc: 'Define escalation paths and notification hierarchies', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },

    // SECURITY & ACCESS CONTROL (5 features)
    { name: 'Role-based access control (RBAC)', category: 'SECURITY & ACCESS CONTROL', desc: 'Implement comprehensive role-based permission system', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Other', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
    { name: 'User authentication and authorization', category: 'SECURITY & ACCESS CONTROL', desc: 'Secure user login with multi-factor authentication support', moscow: 'Must-Have', targetQuarter: 'Q1 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Audit trail and security logging', category: 'SECURITY & ACCESS CONTROL', desc: 'Comprehensive audit logs for all user actions and system changes', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
    { name: 'IP whitelisting and network security', category: 'SECURITY & ACCESS CONTROL', desc: 'Network-level access controls and IP address restrictions', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Session management and timeout controls', category: 'SECURITY & ACCESS CONTROL', desc: 'Configurable session timeouts and concurrent session limits', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },

    // BACKUP & RECOVERY (4 features)
    { name: 'Automated backup scheduling', category: 'BACKUP & RECOVERY', desc: 'Schedule and manage automated cluster backups', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Point-in-time recovery capabilities', category: 'BACKUP & RECOVERY', desc: 'Restore cluster state to specific points in time', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
    { name: 'Backup verification and validation', category: 'BACKUP & RECOVERY', desc: 'Verify backup integrity and validate recovery procedures', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Cross-region backup replication', category: 'BACKUP & RECOVERY', desc: 'Replicate backups across multiple geographic regions', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Expand to EMEA', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

    // MONITORING & METRICS (6 features)
    { name: 'Custom metrics dashboard creation', category: 'MONITORING & METRICS', desc: 'Create custom dashboards with user-defined metrics', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Historical trend analysis', category: 'MONITORING & METRICS', desc: 'Analyze long-term trends in performance and usage metrics', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Performance benchmark comparisons', category: 'MONITORING & METRICS', desc: 'Compare current performance against historical benchmarks', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Predictive analytics and forecasting', category: 'MONITORING & METRICS', desc: 'Predict future performance trends and capacity needs', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 3, technicalComplexity: 5, effortRequired: 4 },
    { name: 'Metrics export and integration', category: 'MONITORING & METRICS', desc: 'Export metrics to external monitoring and analytics systems', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'SLA monitoring and reporting', category: 'MONITORING & METRICS', desc: 'Monitor and report on service level agreement compliance', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },

    // CONFIGURATION MANAGEMENT (5 features)
    { name: 'Configuration versioning and history', category: 'CONFIGURATION MANAGEMENT', desc: 'Track and manage configuration changes with version history', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Configuration templates and presets', category: 'CONFIGURATION MANAGEMENT', desc: 'Predefined configuration templates for common use cases', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Configuration validation and testing', category: 'CONFIGURATION MANAGEMENT', desc: 'Validate configuration changes before applying to production', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Environment-specific configurations', category: 'CONFIGURATION MANAGEMENT', desc: 'Manage separate configurations for different environments', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Configuration drift detection', category: 'CONFIGURATION MANAGEMENT', desc: 'Detect and alert on configuration drift from baseline', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },

    // PERFORMANCE OPTIMIZATION (4 features)
    { name: 'Automated performance tuning recommendations', category: 'PERFORMANCE OPTIMIZATION', desc: 'AI-driven recommendations for performance optimization', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 5, effortRequired: 4 },
    { name: 'Resource utilization optimization', category: 'PERFORMANCE OPTIMIZATION', desc: 'Optimize CPU, memory, and network resource utilization', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Query performance analysis', category: 'PERFORMANCE OPTIMIZATION', desc: 'Analyze and optimize query performance across the cluster', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 4, effortRequired: 3 },
    { name: 'Capacity planning and scaling recommendations', category: 'PERFORMANCE OPTIMIZATION', desc: 'Provide recommendations for cluster scaling and capacity planning', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

    // NETWORKING & COMMUNICATION (3 features)
    { name: 'Network topology visualization', category: 'NETWORKING & COMMUNICATION', desc: 'Visual representation of cluster network topology', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Communication protocol monitoring', category: 'NETWORKING & COMMUNICATION', desc: 'Monitor inter-node communication protocols and performance', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Network partition detection and handling', category: 'NETWORKING & COMMUNICATION', desc: 'Detect and manage network partition scenarios', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },

    // INTEGRATION & APIs (4 features)
    { name: 'REST API for management operations', category: 'INTEGRATION & APIs', desc: 'Comprehensive REST API for programmatic cluster management', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Third-party monitoring system integration', category: 'INTEGRATION & APIs', desc: 'Integration with popular monitoring systems like Prometheus, Grafana', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Webhook notifications and callbacks', category: 'INTEGRATION & APIs', desc: 'Send notifications and event callbacks via webhooks', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'CLI tool for command-line management', category: 'INTEGRATION & APIs', desc: 'Command-line interface for cluster management and automation', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },

    // USER EXPERIENCE (5 features)
    { name: 'Responsive mobile-friendly interface', category: 'USER EXPERIENCE', desc: 'Fully responsive design optimized for mobile and tablet devices', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 4, technicalComplexity: 3, effortRequired: 4 },
    { name: 'Dark mode and theme customization', category: 'USER EXPERIENCE', desc: 'Multiple UI themes including dark mode and customization options', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 2, technicalComplexity: 2, effortRequired: 3 },
    { name: 'Keyboard shortcuts and accessibility', category: 'USER EXPERIENCE', desc: 'Comprehensive keyboard shortcuts and accessibility features', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Increase NPS', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Guided tours and onboarding flow', category: 'USER EXPERIENCE', desc: 'Interactive tutorials and guided onboarding for new users', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Customizable workspace layouts', category: 'USER EXPERIENCE', desc: 'Allow users to customize and save their preferred workspace layouts', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Increase NPS', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },

    // DOCUMENTATION & HELP (3 features)
    { name: 'Integrated help system and documentation', category: 'DOCUMENTATION & HELP', desc: 'Built-in help system with searchable documentation', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 2, effortRequired: 3 },
    { name: 'Context-sensitive help tooltips', category: 'DOCUMENTATION & HELP', desc: 'Contextual help and tooltips throughout the interface', moscow: 'Should-Have', targetQuarter: 'Q2 2026', tshirtSize: 'S', state: 'Missing', goal: 'Improve Onboarding', businessValue: 3, technicalComplexity: 2, effortRequired: 2 },
    { name: 'Video tutorials and learning resources', category: 'DOCUMENTATION & HELP', desc: 'Embedded video tutorials and educational content', moscow: 'Could-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Improve Onboarding', businessValue: 2, technicalComplexity: 2, effortRequired: 3 },

    // TESTING & VALIDATION (3 features)
    { name: 'Automated health checks and diagnostics', category: 'TESTING & VALIDATION', desc: 'Automated system health checks and diagnostic tools', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Performance testing and load simulation', category: 'TESTING & VALIDATION', desc: 'Built-in tools for performance testing and load simulation', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Configuration validation and pre-flight checks', category: 'TESTING & VALIDATION', desc: 'Validate configurations and run pre-flight checks before deployment', moscow: 'Must-Have', targetQuarter: 'Q2 2026', tshirtSize: 'M', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 4, technicalComplexity: 3, effortRequired: 3 },

    // DEPLOYMENT & OPERATIONS (3 features)
    { name: 'Zero-downtime deployment capabilities', category: 'DEPLOYMENT & OPERATIONS', desc: 'Deploy updates and changes without cluster downtime', moscow: 'Must-Have', targetQuarter: 'Q3 2026', tshirtSize: 'XL', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 5, effortRequired: 5 },
    { name: 'Rolling update and rollback mechanisms', category: 'DEPLOYMENT & OPERATIONS', desc: 'Implement rolling updates with automatic rollback capabilities', moscow: 'Must-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Reduce Churn by 5%', businessValue: 5, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Deployment pipeline integration', category: 'DEPLOYMENT & OPERATIONS', desc: 'Integration with CI/CD pipelines and deployment automation', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 4, technicalComplexity: 4, effortRequired: 4 },

    // STREAMING & EVENTS (4 features)
    { name: 'Event streaming dashboard', category: 'STREAMING & EVENTS', desc: 'Real-time dashboard for monitoring event streams', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 4, effortRequired: 4 },
    { name: 'Event processing pipeline visualization', category: 'STREAMING & EVENTS', desc: 'Visual representation of event processing pipelines', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 4, effortRequired: 3 },
    { name: 'Stream analytics and metrics', category: 'STREAMING & EVENTS', desc: 'Analytics and performance metrics for streaming data', moscow: 'Should-Have', targetQuarter: 'Q3 2026', tshirtSize: 'M', state: 'Missing', goal: 'Other', businessValue: 3, technicalComplexity: 3, effortRequired: 3 },
    { name: 'Event replay and debugging tools', category: 'STREAMING & EVENTS', desc: 'Tools for replaying events and debugging streaming applications', moscow: 'Could-Have', targetQuarter: 'Q4 2026', tshirtSize: 'L', state: 'Missing', goal: 'Other', businessValue: 2, technicalComplexity: 4, effortRequired: 4 }
  ];

  console.log(`📊 Starting population of ${allFeatures.length} features across ${categories.length} categories`);

  try {
    // Create all categories first
    for (const categoryName of categories) {
      const categoriesRef = collection(db, 'categories');
      const categoryQuery = query(categoriesRef, 
        where('projectId', '==', projectId), 
        where('name', '==', categoryName)
      );
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (categorySnapshot.empty) {
        await addDoc(categoriesRef, {
          name: categoryName,
          projectId: projectId,
          createdAt: new Date()
        });
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        console.log(`✅ Category exists: ${categoryName}`);
      }
    }

    // Add all features
    let addedCount = 0;
    for (const feature of allFeatures) {
      const featuresRef = collection(db, 'features');
      await addDoc(featuresRef, {
        ...feature,
        projectId: projectId,
        createdAt: new Date()
      });
      addedCount++;
      console.log(`✅ Added feature ${addedCount}/${allFeatures.length}: ${feature.name}`);
    }

    console.log(`🎉 SUCCESS! Added all ${addedCount} Hazelcast features across ${categories.length} categories!`);
    
    // Count features by moscow priority
    const mustHave = allFeatures.filter(f => f.moscow === 'Must-Have').length;
    const shouldHave = allFeatures.filter(f => f.moscow === 'Should-Have').length;
    const couldHave = allFeatures.filter(f => f.moscow === 'Could-Have').length;
    
    console.log(`📈 Summary:
    - Total Features: ${addedCount}
    - Must-Have: ${mustHave}
    - Should-Have: ${shouldHave}
    - Could-Have: ${couldHave}
    - High Impact (Business Value >= 4): ${allFeatures.filter(f => f.businessValue >= 4).length}`);
    
  } catch (error) {
    console.error('❌ Error during population:', error);
    throw error;
  }
}

// Export for use
window.populateAllFeatures = populateAllFeatures;

console.log('📋 Direct populate script loaded. Run: populateAllFeatures()');
