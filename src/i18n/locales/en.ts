export default {
  auth: {
    signIn: {
      title: "Log In",
      email: "Email Address",
      password: "Password",
      submit: "Log In",
      signUpLink: "Don't have an account? Sign Up",
      loading: "Signing in...",
      google: "Continue with Google"
    },
    signUp: {
      title: "Sign Up",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      bio: "Bio",
      city: "City",
      country: "Select Country",
      useLocation: "Use my current location",
      submit: "Sign Up",
      loading: "Signing up...",
      searchCountry: "Search country...",
      close: "Close",
      selectCountry: "Select a Country"
    }
  },
  plans: {
    create: {
      title: "Title",
      titlePlaceholder: "Plan title",
      description: "Description",
      descriptionPlaceholder: "Plan description",
      dateTime: "Date and Time",
      dateTimePlaceholder: "Select date and time",
      location: "Location",
      maxParticipants: "Maximum Participants",
      tags: "Tags",
      tagPlaceholder: "Add tag...",
      image: "Image",
      addImage: "Add image",
      changeImage: "Change image",
      submit: "Create Plan",
    },
    detail: {
      loading: "Loading...",
      notFound: "Plan not found",
      join: "Join Plan",
      chat: "Chat",
      location: "Location",
      date: "Date",
      description: "Description",
      tags: "Tags",
      admins: "Admins"
    },
    edit: {
      title: "Edit Plan",
      save: "Save Changes"
    },
    searchByName: "Search by name",
    notFound: "No plans found",
    allPlans: "All Plans",
    createdPlans: "Created Plans",
    joinedPlans: "Joined Plans",
    leave: "Leave plan",
    leaveTitle: "Leave plan",
    leaveConfirm: "Are you sure you want to leave this plan?",
    filterByCity: "Filter by city",
    searchCity: "Search city",
    searchCityPlaceholder: "Type a city name...",
  },
  chat: {
    title: "Chat",
    messagePlaceholder: "Type a message...",
    joinToChat: "Join the plan to chat",
    participants: "participants"
  },
  profile: {
    edit: {
      title: "Edit Profile",
      username: "Username",
      email: "Email",
      bio: "Bio",
      city: "City",
      country: "Country",
      interests: "Interests",
      addPhoto: "Add Photo",
      save: "Save",
      saving: "Saving...",
      errorLoading: "Error loading user data"
    },
    about: "About",
    interests: "Interests",
    my_plans: "My Plans",
    noPlans: "You haven't joined any plans yet",
    noLocation: "No location set",
    noBio: "No bio yet",
    editButton: "Edit Profile",
    errorLoadingPlans: "Error loading plans",
    other_user_plans: "{{username}}'s Plans",
  },
  common: {
    close: "Close",
    apply: "Apply"
  }, 
  location: {
    permission: {
      title: "Location Permission Required",
      message: "We need access to your location to show you nearby plans.",
      settings: "Go to Settings",
      cancel: "Cancel",
      allow: "Allow location access",
      loading: "Getting location...",
      update: "Update Location"
    },
    permissionTitle: 'Location Permission Required',
    permissionMessage: 'ApenMeet needs access to your location to show you plans near you and enable city filtering.',
    goToSettings: 'Open Settings',
    enableLocation: 'Enable Location',
    locationDisabled: 'Location services are disabled. Please enable them to use city filtering.',
  },
  navigation: {
    home: "Events",
    plans: "Plans",
    chats: "Chats",
    config: "Config"
  },
  events: {
    empty: {
      title: "No events",
      message: "Try refreshing or change your location.",
      refresh: "Refresh"
    },
    showingIn: "Showing events in {{city}}, {{country}}",
    location: "Location",
    date: "Date",
    price: "Price",
    seeMoreInfo: "See more information"
  },
  alerts: {
    location: {
      title: "Location Permission",
      message: "We need access to your location to show you nearby events and connect you with people in your area. Would you like to allow access?",
      allow: "Yes, allow",
      deny: "No, thanks"
    },
    deletePlan: {
      title: "Delete",
      message: "Are you sure you want to delete this plan?",
      confirm: "Delete",
      cancel: "Cancel"
    },
    errors: {
      deletePlan: "Could not delete the plan",
      location: "Error requesting location permission",
      image: "Could not select image",
      refresh: "Error refreshing events",
      login: "log in"
    }
  },
  api: {
    errors: {
      invalidCredentials: "Invalid credentials",
      userNotFound: "User not found",
      invalidOrMissingToken: "Invalid or missing token",
      planNotFound: "Plan not found",
      notParticipant: "You are not a participant of this plan",
      fetchMessages: "Error fetching messages",
      fileTooLarge: "File is too large. Maximum size allowed is 10MB",
      invalidPlanId: "Invalid plan ID",
      planFull: "Plan is full, no more participants allowed",
      alreadyParticipant: "You are already a participant of this plan",
      planClosed: "This plan is not open for joining",
      missingFields: "Missing required fields",
      usernameOrEmailInUse: "Username or email already in use",
      noPermission: "You don't have permission to perform this action",
      noPermissionAddAdmin: "You don't have permission to add administrators",
      alreadyAdmin: "User is already an administrator",
      cannotRemoveCreator: "Cannot remove the creator as administrator",
      serverError: "Internal server error",
      invalidEmailFormat: "Invalid email format",
      passwordTooShort: "Password must be at least 6 characters",
      passwordsDoNotMatch: "Passwords do not match"
    },
    success: {
      joined: "Successfully joined the plan",
      userRegistered: "User registered successfully",
      login: "Login successful",
      adminAdded: "Administrator added successfully",
      adminRemoved: "Administrator removed successfully",
      planUpdated: "Plan updated successfully",
      planDeleted: "Plan deleted successfully",
      planCancelled: "Plan cancelled successfully",
      leftPlan: "Successfully left the plan"
    }
  },
  config: {
    settings: "Settings",
    editProfile: "Edit Profile",
    notifications: "Notifications",
    privacy: "Privacy",
    help: "Help",
    about: "About",
    darkMode: "Dark Mode",
    logout: "Log Out",
    language: "Language"
  },
  adminManagement: {
    title: "Manage Participants",
    addAdmin: "Add Admin",
    removeAdmin: "Remove Admin",
    alreadyAdmin: "Already admin",
    removeUser: "Remove user",
    confirmRemoveTitle: "Remove user",
    confirmRemoveMsg: "Are you sure you want to remove this user from the plan?",
    cancel: "Cancel",
    remove: "Remove",
    you: "You",
    confirmAddAdmin: 'Are you sure you want to make {{name}} an admin?',
    confirmRemoveAdmin: 'Are you sure you want to remove {{name}} as admin?',
    adminAdded: '{{name}} is now an admin',
    adminRemoved: '{{name}} is no longer an admin',
    noAdmins: 'No admins yet',
    searchPlaceholder: 'Search users...',
    adminList: 'Admin List',
    userList: 'User List',
    permissions: {
      title: 'Permissions',
      manageUsers: 'Manage Users',
      manageContent: 'Manage Content',
      manageSettings: 'Manage Settings',
    },
    role: {
      creator: 'Creator',
      admin: 'Admin',
      user: 'User',
    },
  },
}; 