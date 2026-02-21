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
        'http://localhost:5000/api/dro/admin/assign-dro-access',
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
      const res = await axios.get("http://localhost:5000/api/members/", config);
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
      if (editMember) {
        res = await axios.put(
          `http://localhost:5000/api/members/${editMember._id}`,
          { name, contact, password },
          config
        );
        setToastMessage(res.data.message || "Member updated successfully!");
        setEditMember(null);
      } else {
        res = await axios.post(
          "http://localhost:5000/api/members/add",
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
      await axios.delete(`http://localhost:5000/api/members/${id}`, config);
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
    setPassword("");
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
  <div className="container py-4">

    {/* 🔹 TOGGLE FORM BUTTON */}
    <div className="d-flex justify-content-center justify-content-md-start mb-4">
      <Button
        className="w-100 w-md-auto"
        variant={showForm ? "secondary" : "primary"}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Hide Registration Form" : "Add New Member"}
      </Button>
    </div>

    {/* 🔹 REGISTRATION FORM */}
    {showForm && (
      <Card className="shadow border-0 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
        <Card.Body>
          <h4 className="mb-4 text-center text-primary">
            {editMember ? "Edit Member" : "Add Member"}
          </h4>

          <Form onSubmit={handleSubmit}>
            {!editMember && (
              <Form.Group className="mb-3">
                <Form.Label>Member ID</Form.Label>
                <Form.Control
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact</Form.Label>
              <Form.Control
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder={editMember ? "Optional" : "Required"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editMember}
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Please wait..." : editMember ? "Update Member" : "Add Member"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    )}

    {/* 🔹 MEMBERS LIST */}
    <h5 className="mb-3 text-primary">All Members</h5>

    {/* ================= DESKTOP TABLE ================= */}
    <div className="d-none d-md-block">
      <Card className="shadow border-0">
        <Table responsive hover bordered className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Member ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>DRO</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No Members Found
                </td>
              </tr>
            ) : (
              members.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.memberId}</td>
                  <td>{m.name}</td>
                  <td>{m.contact}</td>
                  <td>
                    {m.droAccess?.enabled ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Button size="sm" variant="outline-success"
                        onClick={() => assignDroAccess(m.name)}>
                        Assign
                      </Button>
                    )}
                  </td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2"
                      onClick={() => handleEdit(m)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger"
                      onClick={() => handleDelete(m._id)}>
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

    {/* ================= MOBILE CARD VIEW ================= */}
    <div className="d-block d-md-none">
      {members.length === 0 ? (
        <p className="text-center">No Members Found</p>
      ) : (
        members.map((m, i) => (
          <Card key={m._id} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="fw-bold mb-2">#{i + 1}</div>
              <p className="mb-1"><strong>ID:</strong> {m.memberId}</p>
              <p className="mb-1"><strong>Name:</strong> {m.name}</p>
              <p className="mb-1"><strong>Contact:</strong> {m.contact}</p>

              <div className="mb-2">
                {m.droAccess?.enabled ? (
                  <Badge bg="success">DRO Active</Badge>
                ) : (
                  <Button size="sm" variant="outline-success"
                    onClick={() => assignDroAccess(m.name)}>
                    Assign DRO
                  </Button>
                )}
              </div>

              <div className="d-flex gap-2">
                <Button size="sm" variant="warning" className="w-50"
                  onClick={() => handleEdit(m)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" className="w-50"
                  onClick={() => handleDelete(m._id)}>
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>

    {/* 🔹 TOAST */}
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={showToast}
        bg={toastVariant}
        delay={3000}
        autohide
        onClose={() => setShowToast(false)}
      >
        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
      </Toast>
    </ToastContainer>

  </div>
);
};

export default AddMember;
