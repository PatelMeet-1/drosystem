// src/component/PersonalProfile.jsx - SIMPLE USER VERSION
import React, { useState, useEffect } from "react";
import { Toast, ToastContainer, Button, Form, Card, Spinner, Alert } from "react-bootstrap";

const PersonalProfile = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const user = localStorage.getItem("user");

  useEffect(() => {
    if (user) {
      try {
        const userData = JSON.parse(user);
        setName(userData.name || "");
        setContact(userData.contact || "");
      } catch (err) {
        console.error("User data parse error:", err);
      }
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // User update API - YE ENDPOINT APNE BACKEND ME BANANA PADega
      const response = await fetch('https://drosystem.onrender.com/api/users/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, password })
      });

      if (response.ok) {
        // Update localStorage
        localStorage.setItem("user", JSON.stringify({ ...JSON.parse(user), name, contact }));
        setToastMessage("✅ Profile updated successfully!");
        setToastVariant("success");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setToastMessage("❌ Failed to update profile");
      setToastVariant("danger");
    } finally {
      setLoading(false);
      setShowToast(true);
      setPassword(""); // Clear password
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="text-primary mb-3">👤 My Profile</h2>
        <Alert variant="info">
          Update your personal contact number and password
        </Alert>
      </div>

      <Card className="shadow-lg p-4 mx-auto" style={{ maxWidth: "500px" }}>
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3">
            <Form.Label><strong>Full Name</strong></Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label><strong>Contact Number</strong></Form.Label>
            <Form.Control
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label><strong>New Password (Optional)</strong></Form.Label>
            <Form.Control
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" disabled={loading} className="w-100 btn-lg">
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "💾 Update My Profile"
            )}
          </Button>
        </Form>
      </Card>

      <ToastContainer position="top-end">
        <Toast bg={toastVariant} show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default PersonalProfile;
