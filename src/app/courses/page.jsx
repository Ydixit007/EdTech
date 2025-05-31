"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const ProductCards = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to truncate course name if longer than 20 characters
  const truncateCourseName = (name) => {
    return name.length > 20 ? name.substring(0, 20) + "..." : name;
  };

  // Mock API data - replace this with your actual API call
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with your actual API call
        const mockData = [
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
        ];

        setProducts(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleViewDetails = (product) => {
    // router.push(`/course/${product.id}`);
    router.push("/view-details");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Available Courses
        </h1>

        <div className="flex flex-wrap gap-6 justify-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden w-full sm:w-80 md:w-72 lg:w-80 xl:w-72 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.courseName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-l font-bold text-gray-900 mb-2 line-clamp-2">
                    {truncateCourseName(product.courseName)}
                  </h3>
                  <p className="text-gray-600 text-sm">Course</p>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(product)}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No courses available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCards;
