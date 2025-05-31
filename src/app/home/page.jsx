"use client";
import React, { useState, useEffect, useRef } from "react";

const EdTechHomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mock course data - 9 cards
  const courses = [
    {
      id: 1,
      courseName: "React Development Masterclass",
      price: 89,
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      courseName: "JavaScript Fundamentals",
      price: 65,
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      courseName: "Python for Beginners",
      price: 75,
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      courseName: "Web Design Essentials",
      price: 95,
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      courseName: "Mobile App Development",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      courseName: "Data Science Bootcamp",
      price: 150,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    },
    {
      id: 7,
      courseName: "UI/UX Design Course",
      price: 110,
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    },
    {
      id: 8,
      courseName: "Machine Learning Basics",
      price: 135,
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    },
    {
      id: 9,
      courseName: "Cloud Computing AWS",
      price: 180,
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    },
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, courses.length - 3);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [courses.length]);

  // Smooth scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 320;
      scrollRef.current.style.transform = `translateX(-${
        currentIndex * cardWidth
      }px)`;
    }
  }, [currentIndex]);

  const handleViewDetails = (course) => {
    console.log("View details for:", course);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-blue-600">EduTech Pro</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#courses" className="text-gray-700 hover:text-blue-600">
                Courses
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Transform Your Future with Tech Skills
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students learning cutting-edge technologies with
            our expert-led courses
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Start Learning Today
          </button>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Featured Courses
          </h3>

          <div className="relative overflow-hidden">
            <div
              ref={scrollRef}
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ width: `${courses.length * 320}px` }}
            >
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden w-80 flex-shrink-0 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.courseName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.courseName}
                      </h4>
                      <p className="text-gray-600 text-sm">Course</p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ${course.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewDetails(course)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.max(1, courses.length - 2) }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                About EduTech Pro
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                We are a leading EdTech platform dedicated to making quality
                tech education accessible to everyone. Our mission is to bridge
                the gap between traditional education and industry requirements.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                With over 50,000 students worldwide and partnerships with top
                tech companies, we provide hands-on learning experiences that
                prepare you for real-world challenges.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50K+</div>
                  <div className="text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">100+</div>
                  <div className="text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students learning"
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h4 className="text-2xl font-bold text-blue-400 mb-4">
                EduTech Pro
              </h4>
              <p className="text-gray-300 mb-4">
                Empowering learners worldwide with cutting-edge technology
                education.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-blue-400">
                  Twitter
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-400">
                  LinkedIn
                </a>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">Contact</h5>
              <div className="space-y-2 text-gray-300">
                <p>📧 info@edutechpro.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Tech Street, San Francisco, CA 94105</p>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
              <div className="space-y-2">
                <a href="#" className="block text-gray-300 hover:text-blue-400">
                  Terms & Conditions
                </a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">
                  Privacy Policy
                </a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">
                  Refund Policy
                </a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">
                  Support
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduTech Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EdTechHomePage;
