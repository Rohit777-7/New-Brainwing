export const projects = [
  {
    id: "mumbai-01",
    city: "mumbai",
    name: "Mumbai Project One",
    location: "Mumbai, Maharashtra",
    category: "Residential",
    coordinates: [0.18, 0.12],
    image: "/assets/projects/mumbai/project-01.svg",
    description: "A placeholder project record ready for Brainwing's real project information."
  },
  {
    id: "mumbai-02",
    city: "mumbai",
    name: "Mumbai Project Two",
    location: "Mumbai, Maharashtra",
    category: "Commercial",
    coordinates: [-0.22, -0.08],
    image: "/assets/projects/mumbai/project-02.svg",
    description: "A second project marker for the Mumbai city experience."
  },
  {
    id: "mumbai-03",
    city: "mumbai",
    name: "Mumbai Project Three",
    location: "Mumbai, Maharashtra",
    category: "Mixed Use",
    coordinates: [0.04, -0.24],
    image: "/assets/projects/mumbai/project-03.svg",
    description: "A third project marker demonstrating the reusable project system."
  },
  {
    id: "bangalore-01",
    city: "bangalore",
    name: "Bangalore Project One",
    location: "Bangalore, Karnataka",
    category: "Residential",
    coordinates: [-0.1, 0.08],
    image: "/assets/projects/bangalore/project-01.svg",
    description: "Placeholder Bangalore project."
  },
  {
    id: "chennai-01",
    city: "chennai",
    name: "Chennai Project One",
    location: "Chennai, Tamil Nadu",
    category: "Commercial",
    coordinates: [0.12, -0.05],
    image: "/assets/projects/chennai/project-01.svg",
    description: "Placeholder Chennai project."
  }
];

export const getProjectsByCity = (city) => projects.filter((project) => project.city === city);