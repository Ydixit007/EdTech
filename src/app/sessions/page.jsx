"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Sessions = () => {
  // State for tracking purchased courses and toast
  const [purchasedCourses, setPurchasedCourses] = useState(new Set());
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // Simulate user login status - replace with your actual auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Change to true to test logged in state

  // Sample data based on your API response
  const courseData = {
    _id: "683829c084ba8fd6fea16968",
    title: "Complete Web Development Course",
    description:
      "Learn HTML, CSS, JavaScript and React from scratch. This comprehensive course covers everything you need to know to become a full-stack web developer.",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    price: 700,
    duration: 7200, // Total course duration in seconds
    videos: [
      {
        title: "Introduction to HTML",
        duration: 1200,
        order: 1,
        _id: "683829c084ba8fd6fea16969",
      },
      {
        title: "CSS Basics",
        duration: 1800,
        order: 2,
        _id: "683829c084ba8fd6fea1696a",
      },
      {
        title: "JavaScript Fundamentals",
        duration: 2400,
        order: 3,
        _id: "683829c084ba8fd6fea1696b",
      },
      {
        title: "React Introduction",
        duration: 1800,
        order: 4,
        _id: "683829c084ba8fd6fea1696c",
      },
    ],
  };

  // Convert seconds to hours and minutes
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) {
      return `${minutes} min`;
    }
    return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
  };

  // Handle Buy button click
  const handleBuyClick = (courseId) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // If logged in, redirect to payment gateway
    console.log(`Redirecting to payment gateway for course: ${courseId}`);
    // In real app, you would redirect to your payment gateway
    // window.location.href = `/payment?courseId=${courseId}`;

    // For demo, simulate purchase completion
    setTimeout(() => {
      setPurchasedCourses((prev) => new Set([...prev, courseId]));
      showToastMessage("Course purchased successfully! You can now enroll.");
    }, 1000);
  };

  // Handle Enroll button click
  const handleEnrollClick = (courseId) => {
    setEnrolledCourses((prev) => new Set([...prev, courseId]));
    showToastMessage("Successfully enrolled in the course!");
  };

  // Handle login modal close
  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    router.push("/login");
    console.log("Redirecting to login page...");
  };

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Check if course is purchased
  const isPurchased = (courseId) => purchasedCourses.has(courseId);

  // Check if course is enrolled
  const isEnrolled = (courseId) => enrolledCourses.has(courseId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-gray-500 mb-6">
                Please log in first to purchase this course.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleLoginModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Course Header with Image */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Course Image */}
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <img
              src={courseData.thumbnail}
              alt={courseData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Course Details */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {courseData.title}
            </h1>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {courseData.description}
            </p>

            {/* Course Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  {formatDuration(courseData.duration)}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                  <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5a.75.75 0 001.5 0v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 11-9 0v-.357z" />
                </svg>
                <span className="font-medium">
                  {courseData.videos.length} Lessons
                </span>
              </div>
            </div>

            {/* Price and Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  ${courseData.price}
                </span>
              </div>

              <div className="flex gap-3">
                {isEnrolled(courseData._id) ? (
                  <div className="flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Enrolled</span>
                  </div>
                ) : isPurchased(courseData._id) ? (
                  <button
                    onClick={() => handleEnrollClick(courseData._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enroll Now
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyClick(courseData._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.466 5.87a1 1 0 00.95.734H13a1 1 0 00.95-.734L15.22 4H5.78l-.22-.876C5.455 2.68 4.819 2 4.054 2H3a1 1 0 000 2z" />
                      <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Buy Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Session Content
          </h2>
          <div className="space-y-4">
            {courseData.videos.map((video, index) => (
              <div
                key={video._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{video.title}</h3>
                    <p className="text-sm text-gray-500">
                      Lesson {video.order}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    {formatDuration(video.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
