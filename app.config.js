export default {
  name: "ApenMeet",
  android: {
    package: "com.apenmeet.app",
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  }
}; 