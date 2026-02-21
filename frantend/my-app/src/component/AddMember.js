import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Toast,
  ToastContainer,
  Button,
  Form,
  Card,
  Spinner,
  Table,
  Modal,
  Badge
} from "react-bootstrap";

const AddMember = () => {
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [editMember, setEditMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // 🔥 ASSIGN DRO ACCESS FUNCTION
  const assignDroAccess = async (memberName) => {
    if (!window.confirm(`Assign DRO access to ${memberName}?`)) return;
    
    try {
      const res = await axios.post(
        'https://drosystem-3.onrender.com/api/dro/admin/assign-dro-access',
        { memberName },
        config
      );
      
      setToastMessage(res.data.message || `${memberName} ko DRO access de diya!`);
      setToastVariant("success");
      setShowToast(true);
      fetchMembers();
    } catch (err) {
      console.error('DRO Assign Error:', err);
      setToastMessage(err.response?.data?.message || 'Error assigning DRO access');
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://drosystem-3.onrender.com/api/members/", config);
      setMembers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  useEffect(() => {
    if (token) fetchMembers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      let payload;
      
      // 🔥 PASSWORD FIX - Only send password if it's not empty
      if (editMember) {
        payload = { name, contact };
        if (password.trim()) {
          payload.password = password;
        }
        res = await axios.put(
          `https://drosystem-3.onrender.com/api/members/${editMember._id}`,
          payload,
          config
        );
        setToastMessage(res.data.message || "Member updated successfully!");
        setEditMember(null);
      } else {
        res = await axios.post(
          "https://drosystem-3.onrender.com/api/members/add",
          { memberId, name, contact, password },
          config
        );
        setToastMessage(res.data.message || "Member added successfully!");
      }

      setToastVariant("success");
      setShowToast(true);
      setMemberId("");
      setName("");
      setContact("");
      setPassword("");
      fetchMembers();
    } catch (err) {
      console.error(err);
      setToastMessage(err.response?.data?.message || "Failed to add/update member");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await axios.delete(`https://drosystem-3.onrender.com/api/members/${id}`, config);
      setToastMessage("Member deleted successfully!");
      setToastVariant("success");
      setShowToast(true);
      fetchMembers();
    } catch (err) {
      setToastMessage("Failed to delete member");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleEdit = (member) => {
    setEditMember(member);
    setMemberId(member.memberId);
    setName(member.name);
    setContact(member.contact);
    setPassword(""); // Always reset password for edit
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditMember(null);
    setMemberId("");
    setName("");
    setContact("");
    setPassword("");
    setShowModal(false);
  };

  return (
    <div className="container py-5">
      {/* Toggle Form Button */}
      <Button
        className="mb-4 w-100 w-md-auto"
        variant={showForm ? "secondary" : "primary"}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Hide Registration Form" : "Show Registration Form"}
      </Button>

      {/* Registration Form */}
      {showForm && (
        <Card className="shadow-lg border-0 p-4 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          <h3 className="mb-4 text-primary">{editMember ? "Edit Member" : "Add New Member"}</h3>
          <Form onSubmit={handleSubmit}>
            {!editMember && (
              <Form.Group className="mb-3" controlId="formMemberId">
                <Form.Label>Member ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter member ID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formContact">
              <Form.Label>Contact</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder={editMember ? "Enter new password (optional)" : "Enter password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editMember}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editMember ? "Updating..." : "Adding..."}
                </>
              ) : editMember ? (
                "Update Member"
              ) : (
                "Add Member"
              )}
            </Button>
          </Form>
        </Card>
      )}

      {/* Members Table */}
      <div className="mb-4">
        <h5 className="mb-3 text-primary">All Members</h5>

        {/* Desktop Table */}
        <div className="d-none d-md-block">
          <Card className="shadow-lg border-0 p-3">
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>DRO Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No members found
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member._id}>
                      <td>{index + 1}</td>
                      <td>{member.memberId}</td>
                      <td>{member.name}</td>
                      <td>{member.contact}</td>
                      <td>
                        {member.droAccess?.enabled ? (
                          <Badge bg="success">✅ DRO Active</Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline-success"
                            onClick={() => assignDroAccess(member.name)}
                          >
                            Assign DRO
                          </Button>
                        )}
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="warning" 
                          className="me-2" 
                          onClick={() => handleEdit(member)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDelete(member._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="d-block d-md-none">
          {members.length === 0 ? (
            <p className="text-center">No members found</p>
          ) : (
            members.map((member, index) => (
              <Card key={member._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <p className="mb-1"><strong>#{index + 1}</strong></p>
                  <p className="mb-1"><strong>Member ID:</strong> {member.memberId}</p>
                  <p className="mb-1"><strong>Name:</strong> {member.name}</p>
                  <p className="mb-1"><strong>Contact:</strong> {member.contact}</p>
                  
                  <div className="mb-2">
                    {member.droAccess?.enabled ? (
                      <Badge bg="success">✅ DRO Active</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline-success" 
                        className="me-2"
                        onClick={() => assignDroAccess(member.name)}
                      >
                        Assign DRO
                      </Button>
                    )}
                  </div>
                  
                  <div className="d-flex justify-content-between mt-2">
                    <Button size="sm" variant="warning" onClick={() => handleEdit(member)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(member._id)}>
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer className="p-3" position="top-end">
        <Toast 
          bg={toastVariant} 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="editName">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editContact">
              <Form.Label>Contact</Form.Label>
              <Form.Control 
                type="text" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editPassword">
              <Form.Label>New Password <span className="text-muted fs-6">(optional)</span></Form.Label>
              <Form.Control
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Update Member
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddMember;
