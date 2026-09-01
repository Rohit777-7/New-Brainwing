/*
 * coordinates are [lon, lat] for the real Mapbox map.
 *
 * Project URLs are currently pointing to working BrainWing
 * pages. Replace them later with the final project URLs.
 */

export const projects = [
  {
    id: "mumbai-01",
    city: "mumbai",
    name: "Mumbai Project One",
    location: "Mumbai, Maharashtra",
    category: "Residential",
    coordinates: [72.8977, 19.091],
    image: "/assets/projects/mumbai/project-01.svg",
    description:
      "A placeholder project record ready for Brainwing's real project information.",
    url: "https://brainwing.in/shivani-mumbai.php",
  },

  {
    id: "mumbai-02",
    city: "mumbai",
    name: "Mumbai Project Two",
    location: "Mumbai, Maharashtra",
    category: "Commercial",
    coordinates: [72.8477, 19.066],
    image: "/assets/projects/mumbai/project-02.svg",
    description:
      "A second project marker for the Mumbai city experience.",
    url: "https://brainwing.in/case-studies.php",
  },

  {
    id: "mumbai-03",
    city: "mumbai",
    name: "Mumbai Project Three",
    location: "Mumbai, Maharashtra",
    category: "Mixed Use",
    coordinates: [72.8827, 19.046],
    image: "/assets/projects/mumbai/project-03.svg",
    description:
      "A third project marker demonstrating the reusable project system.",
    url: "https://brainwing.in/case-studies.php",
  },

  {
    id: "bangalore-01",
    city: "bangalore",
    name: "Bangalore Project One",
    location: "Bangalore, Karnataka",
    category: "Residential",
    coordinates: [77.6096, 12.9816],
    image: "/assets/projects/bangalore/project-01.svg",
    description:
      "Placeholder Bangalore project.",
    url: "https://brainwing.in/",
  },

  {
    id: "chennai-01",
    city: "chennai",
    name: "Chennai Project One",
    location: "Chennai, Tamil Nadu",
    category: "Commercial",
    coordinates: [80.2907, 13.0727],
    image: "/assets/projects/chennai/project-01.svg",
    description:
      "Placeholder Chennai project.",
    url: "https://brainwing.in/",
  },
];

export const getProjectsByCity = (city) =>
  projects.filter(
    (project) => project.city === city
  );