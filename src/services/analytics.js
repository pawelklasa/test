import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";

// Track when users sign up
export const trackUserSignup = (method = 'email') => {
  logEvent(analytics, 'sign_up', {
    method: method
  });
};

// Track when users log in
export const trackUserLogin = (method = 'email') => {
  logEvent(analytics, 'login', {
    method: method
  });
};

// Track when users create their first project
export const trackProjectCreated = (projectName) => {
  logEvent(analytics, 'project_created', {
    project_name: projectName
  });
};

// Track when users add features
export const trackFeatureAdded = (category, priority) => {
  logEvent(analytics, 'feature_added', {
    category: category,
    priority: priority
  });
};

// Track page views
export const trackPageView = (pageName) => {
  logEvent(analytics, 'page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

// Track when users use search functionality
export const trackSearchUsed = (searchTerm, projectId) => {
  logEvent(analytics, 'search_used', {
    search_term: searchTerm,
    project_id: projectId
  });
};

// Track when users manage team members
export const trackUserManagement = (action, role, projectId) => {
  logEvent(analytics, 'user_management', {
    action: action, // 'add_user', 'edit_user', 'remove_user'
    user_role: role,
    project_id: projectId
  });
};

// Track when users use filters
export const trackFilterUsed = (filterType, filterValue, projectId) => {
  logEvent(analytics, 'filter_used', {
    filter_type: filterType,
    filter_value: filterValue,
    project_id: projectId
  });
};

// Track when users delete features
export const trackFeatureDeleted = (category) => {
  logEvent(analytics, 'feature_deleted', {
    category: category
  });
};

// Track category creation
export const trackCategoryCreated = (categoryName) => {
  logEvent(analytics, 'category_created', {
    category_name: categoryName
  });
};

// Track when users switch projects
export const trackProjectSwitched = (fromProject, toProject) => {
  logEvent(analytics, 'project_switched', {
    from_project: fromProject,
    to_project: toProject
  });
};

// Track when users rename projects
export const trackProjectRenamed = (projectId, oldName, newName) => {
  logEvent(analytics, 'project_renamed', {
    project_id: projectId,
    old_name: oldName,
    new_name: newName
  });
};
