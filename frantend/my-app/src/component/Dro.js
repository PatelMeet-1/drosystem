import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Button, Table, Modal, Badge, Alert, Spinner 
} from 'react-bootstrap';
import { 
  FaEye, FaCopy, FaClock, FaSync, FaUserPlus, FaUserCheck, FaUserTimes, 
  FaToggleOn, FaToggleOff, FaStopwatch 
} from 'react-icons/fa';

// 🔥 SAFE TOSTRING FUNCTION
const safeToString = (value) => (value || 0).toString().padStart(2, '0');

const API_URL = process.env.REACT_APP_API_URL || 'https://drosystem.onrender.com';

const Dro = () => {
  const token = localStorage.getItem('token');
  const userToken = localStorage.getItem('userToken');
  const authToken = token || userToken; // ✅ Admin = token, User = userToken
  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;
  const userName = parsedUser?.name || '';
  
  // 🔥 ALL STATES
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDroUser, setIsDroUser] = useState(false);
  const [members, setMembers] = useState([]);
  const [droHistory, setDroHistory] = useState([]);
  const [showDroModal, setShowDroModal] = useState(false);
  const [selectedDro, setSelectedDro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDroUsersPanel, setShowDroUsersPanel] = useState(false);
  const [membersWithStatus, setMembersWithStatus] = useState([]);
  const [adminMembersLoading, setAdminMembersLoading] = useState(false);
  const [droUsersLoading, setDroUsersLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmMemberName, setConfirmMemberName] = useState('');
  
  // 🔥 GLOBAL TIMER STATES
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [globalTimer, setGlobalTimer] = useState({ hours: 0, minutes: 0, seconds: 5 });
  const [timerLoading, setTimerLoading] = useState(false);

  // 🔥 PERFECT API CONFIGS - Admin (token) ya User (userToken) dono ke liye
  const getApiConfig = useCallback((useToken = false) => {
    if (useToken && authToken) {
      return { 
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          'Content-Type': 'application/json' 
        } 
      };
    }
    return { headers: { 'Content-Type': 'application/json' } };
  }, [authToken]);

  // 🔥 Fisher-Yates Shuffle
  const fisherYatesShuffle = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // 🔥 FIXED MEMBERS API - User bhi members dekh sake (userToken se)
  const fetchMembersForDro = useCallback(async () => {
    setMembersLoading(true);
    setError('');
    console.log('🔍 Fetching members... Auth:', !!authToken);
    
    try {
      const config = getApiConfig(true);
      const res = await axios.get(`${API_URL}/api/members/`, config);
      
      const membersData = Array.isArray(res.data) 
        ? res.data 
        : res.data.data || res.data || [];
      
      console.log('✅ Members LOADED:', membersData.length);
      setMembers(membersData);
      setError('');
    } catch (err) {
      console.error('❌ Members Error:', err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        setError('⚠️ Login required! Token expire ho gaya.');
        localStorage.removeItem('token');
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
      } else {
        setError(`❌ Members load nahi hue (${err.response?.status}): ${err.response?.data?.message || err.message}`);
      }
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [getApiConfig, authToken]);

  // 🔥 Other API functions - User bhi history dekh sake
  const fetchDroHistory = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await axios.get(`${API_URL}/api/dro/history`, getApiConfig(true));
      setDroHistory(res.data || []);
    } catch (err) {
      console.error('History fetch error:', err);
      setDroHistory([]);
    }
  }, [getApiConfig, authToken]);

  const fetchGlobalTimer = useCallback(async () => {
    try {
      const config = authToken ? getApiConfig(true) : getApiConfig(false);
      const res = await axios.get(`${API_URL}/api/dro/get-timer`, config);
      console.log('⏰ Global Timer:', res.data);
      setGlobalTimer(res.data.timer || { hours: 0, minutes: 0, seconds: 5 });
    } catch (err) {
      console.error('Timer fetch error:', err);
      setGlobalTimer({ hours: 0, minutes: 0, seconds: 5 });
    }
  }, [getApiConfig, authToken]);

  const fetchMembersWithDroStatus = useCallback(async () => {
    if (!token) return;
    setAdminMembersLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/dro/members-with-status`, getApiConfig(true));
      setMembersWithStatus(res.data || []);
    } catch (err) {
      console.error('Status fetch error:', err);
      setMembersWithStatus([]);
    } finally {
      setAdminMembersLoading(false);
    }
  }, [getApiConfig, token]);

  const checkCurrentUserDroStatus = useCallback(async () => {
    if (!userName) return;
    try {
      const res = await axios.get(`${API_URL}/api/dro/check/${encodeURIComponent(userName)}`, getApiConfig(false));
      setIsDroUser(res.data.hasDroAccess);
    } catch (err) {
      setIsDroUser(false);
    }
  }, [userName, getApiConfig]);

  // 🔥 FIXED GENERATE DRO
  const generateDroDirect = useCallback(async () => {
    console.log('🚀 GENERATE DRO - Members:', members.length);
    
    if (membersLoading) {
      alert('⏳ Members loading... Please wait!');
      return;
    }

    if (members.length === 0) {
      alert('❌ NO MEMBERS! Pehle Members page se add karo.');
      return;
    }

    const totalSeconds = globalTimer.hours * 3600 + globalTimer.minutes * 60 + globalTimer.seconds;
    if (totalSeconds === 0) {
      alert('⚠️ Timer zero hai! Admin se set karwao.');
      return;
    }

    setLoading(true);
    try {
      const shuffledMembers = fisherYatesShuffle(members);
      const droData = {
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN', { hour12: true }),
        totalMembers: shuffledMembers.length,
        order: shuffledMembers.map((member, index) => ({
          position: index + 1,
          suffix: ['st', 'nd', 'rd'][index % 3] || 'th',
          name: member.name,
          memberId: member.memberId || `M${(index + 1).toString().padStart(3, '0')}`,
        }))
      };

      const response = await axios.post(`${API_URL}/api/dro/save`, droData, getApiConfig(true));
      console.log('✅ DRO SAVED:', response.data);
      
      await fetchDroHistory();
      alert(`🎉 DRO SAVED!\n🥇 1st: ${shuffledMembers[0].name}\n👥 Total: ${shuffledMembers.length}`);
    } catch (err) {
      console.error('❌ DRO ERROR:', err.response?.data);
      alert(`❌ DRO FAILED: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [members, globalTimer, fisherYatesShuffle, getApiConfig, membersLoading, fetchDroHistory, token]);

  // 🔥 Admin functions
  const handleSetGlobalTimer = useCallback(async () => {
    const totalSeconds = globalTimer.hours * 3600 + globalTimer.minutes * 60 + globalTimer.seconds;
    if (totalSeconds === 0) {
      alert('⚠️ At least 1 second set karo!');
      return;
    }

    setTimerLoading(true);
    try {
      await axios.post(`${API_URL}/api/dro/set-timer`, globalTimer, getApiConfig(true));
      alert(`✅ TIMER SET: ${safeToString(globalTimer.hours)}h:${safeToString(globalTimer.minutes)}m:${safeToString(globalTimer.seconds)}s`);
      await fetchGlobalTimer();
      setShowTimerModal(false);
    } catch (err) {
      alert(`❌ Timer failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setTimerLoading(false);
    }
  }, [globalTimer, getApiConfig, fetchGlobalTimer]);

  const handleTimerChange = useCallback((field, value) => {
    const numValue = parseInt(value) || 0;
    if (field === 'hours' && numValue > 23) return;
    if ((field === 'minutes' || field === 'seconds') && numValue > 59) return;
    setGlobalTimer(prev => ({ ...prev, [field]: numValue }));
  }, []);

  const toggleDroAccess = useCallback((memberName, currentStatus) => {
    setConfirmMemberName(memberName);
    setConfirmAction(currentStatus ? 'remove' : 'assign');
    setShowConfirmModal(true);
  }, []);

  // 🔥 FIXED CONFIRM ACTION - BETTER DEBUGGING
  const handleConfirmAction = useCallback(async () => {
    setDroUsersLoading(true);
    try {
      const endpoint = confirmAction === 'assign' 
        ? `${API_URL}/api/dro/admin/assign-dro-access`
        : `${API_URL}/api/dro/admin/remove-dro-access`;
      
      console.log('🔥 GRANT/REMOVE REQUEST:', { memberName: confirmMemberName, endpoint });
      
      const response = await axios.post(endpoint, { memberName: confirmMemberName }, getApiConfig(true));
      console.log('✅ GRANT/REMOVE SUCCESS:', response.data);
      
      alert(`✅ ${confirmMemberName} ko DRO ${confirmAction === 'assign' ? 'DE DIYA' : 'HATA DIYA'}`);
      await fetchMembersWithDroStatus();
    } catch (err) {
      console.error('❌ GRANT/REMOVE ERROR:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        requestData: { memberName: confirmMemberName }
      });
      alert(`❌ FAILED: ${err.response?.data?.message || err.message}`);
    } finally {
      setDroUsersLoading(false);
      setShowConfirmModal(false);
    }
  }, [confirmAction, confirmMemberName, getApiConfig, fetchMembersWithDroStatus]);

  // 🔥 FIXED INITIALIZATION - User login par bhi members + history load
  useEffect(() => {
    console.log('🔥 DRO MOUNTED - Admin:', !!token, 'Auth:', !!authToken);
    
    const init = async () => {
      setIsAdmin(!!token);
      
      await Promise.allSettled([
        fetchMembersForDro(),
        authToken ? fetchDroHistory() : Promise.resolve(),
        fetchGlobalTimer(),
        token ? fetchMembersWithDroStatus() : Promise.resolve(),
        userName ? checkCurrentUserDroStatus() : Promise.resolve()
      ]);
      
      console.log('✅ DRO INIT COMPLETE');
    };
    
    init();
  }, [fetchMembersForDro, fetchDroHistory, fetchGlobalTimer, fetchMembersWithDroStatus, checkCurrentUserDroStatus, token, authToken, userName]);

  // 🔥 COMPUTED VALUES
  const droUsersCount = membersWithStatus.filter(m => m.droAccess?.enabled).length;
  const canGenerateDro = isAdmin || isDroUser;
  const buttonDisabled = loading || membersLoading || members.length === 0;
  const timerSet = globalTimer.hours + globalTimer.minutes + globalTimer.seconds > 0;

  // 🔥 Utility functions
  const getTimerDisplay = useCallback((dro) => {
    if (!dro) return '00:00:05';
    return `${safeToString(dro.hours)}:${safeToString(dro.minutes)}:${safeToString(dro.seconds)}`;
  }, []);

  const viewDro = useCallback((dro) => {
    setSelectedDro(dro);
    setShowDroModal(true);
  }, []);

  const copyDro = useCallback(() => {
    const text = selectedDro?.order?.map(item => `${item.position}${item.suffix} - ${item.name}`).join('\n') || '';
    navigator.clipboard.writeText(text);
    alert('✅ DRO copied to clipboard!');
  }, [selectedDro]);

return (
  <Container fluid className="px-3 px-md-4 py-3 py-md-5 min-vh-100 bg-white">
    <Row>
      <Col xs={12}>
        {/* 🔥 HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-bold text-dark mb-4 h2">🎯 DRO Result System</h1>
          <p className="lead text-muted mb-4">Members: <strong>{members.length}</strong></p>

          {/* 🔥 GLOBAL TIMER */}
          <Alert variant={timerSet ? "info" : "warning"} className="text-center mb-4 shadow">
            <FaStopwatch className="me-2 fs-5 text-primary" />
            <strong>Timer:</strong> 
            <span className="h3 fw-bold text-dark ms-2">
              {safeToString(globalTimer.hours)}h : {safeToString(globalTimer.minutes)}m : {safeToString(globalTimer.seconds)}s
            </span>
            {isAdmin && (
              <Button className="ms-3 fw-bold" onClick={() => setShowTimerModal(true)}>
                <FaClock className="me-1" /> Set Timer
              </Button>
            )}
          </Alert>

          {/* 🔥 DRO BUTTON */}
          {canGenerateDro ? (
            <Button
              variant="primary"
              size="lg"
              className="w-100 w-md-auto px-5 py-3 fw-bold shadow mb-4 position-relative"
              onClick={generateDroDirect}
              disabled={buttonDisabled || !timerSet}
            >
              {membersLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Loading Members...
                </>
              ) : loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Generating DRO...
                </>
              ) : members.length === 0 ? (
                <>
                  <FaUserTimes className="me-3 text-warning" />
                  No Members
                </>
              ) : !timerSet ? (
                <>
                  <FaClock className="me-3 text-warning" />
                  Set Timer First
                </>
              ) : (
                <>
                  <span className="me-3 fs-1">🎲</span>
                  <span className="fs-4">GENERATE DRO</span>
                  <Badge bg="light" text="dark" className="ms-3 fs-6 px-3 py-2">
                    {members.length} Members
                  </Badge>
                </>
              )}
            </Button>
          ) : (
            <Alert variant="secondary" className="text-center py-5 shadow">
              <FaUserTimes className="fs-1 mb-3 text-muted" />
              <h4>🔒 No DRO Access</h4>
              <p>Admin se access maango!</p>
            </Alert>
          )}

          {isAdmin && (
            <Button
              variant="outline-primary"
              size="lg"
              className="w-100 w-md-auto px-5 py-3 fw-bold shadow"
              onClick={() => setShowDroUsersPanel(!showDroUsersPanel)}
            >
              <FaUserPlus className="me-2" /> 
              Manage DRO Users <Badge bg="primary" className="ms-2">{droUsersCount}</Badge>
            </Button>
          )}
        </div>

        {/* 🔥 MEMBERS STATUS */}
        {members.length > 0 && (
          <Alert variant="success" className="text-center mb-4 shadow">
            ✅ <strong className="h3 text-primary">{members.length}</strong> Members Ready!
          </Alert>
        )}

        {/* 🔥 ERROR */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow">
            <strong>❌ {error}</strong>
          </Alert>
        )}

        {/* 🔥 ADMIN PANEL - MOBILE RESPONSIVE CARDS */}
        {isAdmin && showDroUsersPanel && (
          <Card className="shadow mb-5 border-0">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0 fw-bold">
                  <FaUserPlus className="me-2" /> DRO Users ({membersWithStatus.length})
                </h3>
                <Button size="sm" variant="outline-light" onClick={fetchMembersWithDroStatus}>
                  <FaSync className="me-1" /> Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* MOBILE: Cards Layout */}
              <div className="dro-users-cards d-md-none">
                {membersWithStatus.map((member, index) => (
                  <Card key={member._id || member.memberId} className="mb-3 shadow-sm border-0">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong className="h6 mb-0 text-primary">#{index + 1}</strong>
                        <div>
                          {member.droAccess?.enabled ? (
                            <Badge bg="success" className="fs-6">
                              <FaToggleOn className="me-1" /> Active
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="fs-6">
                              <FaToggleOff className="me-1" /> Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h5 className="fw-bold mb-2">{member.name}</h5>
                      <Badge bg="info" className="mb-2 d-block">ID: {member.memberId}</Badge>
                      <Button
                        size="sm"
                        variant={member.droAccess?.enabled ? "outline-danger" : "outline-success"}
                        className="w-100 fw-bold mt-2"
                        onClick={() => toggleDroAccess(member.name, member.droAccess?.enabled)}
                        disabled={droUsersLoading}
                      >
                        {member.droAccess?.enabled ? 'Remove' : 'Grant'}
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              
              {/* DESKTOP: Table Layout */}
              <div className="table-responsive d-none d-md-block">
                <Table striped bordered hover className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersWithStatus.map((member, index) => (
                      <tr key={member._id || member.memberId}>
                        <td className="fw-bold">{index + 1}</td>
                        <td><strong>{member.name}</strong></td>
                        <td><Badge bg="info">{member.memberId}</Badge></td>
                        <td>
                          {member.droAccess?.enabled ? (
                            <Badge bg="success" className="fs-6">
                              <FaToggleOn className="me-1" /> Active
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="fs-6">
                              <FaToggleOff className="me-1" /> Inactive
                            </Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={member.droAccess?.enabled ? "outline-danger" : "outline-success"}
                            className="fw-bold"
                            onClick={() => toggleDroAccess(member.name, member.droAccess?.enabled)}
                            disabled={droUsersLoading}
                          >
                            {member.droAccess?.enabled ? 'Remove' : 'Grant'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* 🔥 DRO HISTORY - MOBILE RESPONSIVE CARDS */}
        <Card className="shadow border-0">
          <Card.Header className="bg-light border-bottom p-3">
            <h2 className="mb-0 fw-bold text-dark h4">📋 DRO History ({droHistory.length})</h2>
          </Card.Header>
          <Card.Body className="p-0">
            {/* MOBILE: Cards Layout */}
            <div className="dro-history-cards d-md-none">
              {droHistory.map((dro, index) => (
                <Card key={dro._id || index} className="mb-3 shadow-sm border-0 mx-2">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <strong className="h6 text-primary mb-0">#{index + 1}</strong>
                      <Badge bg="primary" className="fs-6">
                        {dro.time}
                      </Badge>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted">Date</small>
                        <p className="mb-2 fw-semibold">{dro.date}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Total</small>
                        <Badge bg="secondary" className="fs-6 d-block">{dro.totalMembers}</Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">🥇 1st Position</small>
                      <Badge bg="warning" className="fw-bold px-3 py-2 fs-6">
                        {dro.order?.[0]?.name || 'N/A'}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <small className="text-muted d-block mb-1">⏰ Timer</small>
                      <Badge bg="info" className="px-3 py-2 fw-bold fs-6">
                        <FaClock className="me-1" />
                        {getTimerDisplay(dro)}
                      </Badge>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      className="w-100 fw-bold" 
                      onClick={() => viewDro(dro)}
                    >
                      <FaEye className="me-1" /> View Details
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* DESKTOP: Table Layout */}
            <div className="table-responsive d-none d-md-block">
              <Table striped bordered hover className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>🥇 1st</th>
                    <th>Total</th>
                    <th>⏰ Timer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {droHistory.map((dro, index) => (
                    <tr key={dro._id || index}>
                      <td className="fw-bold">{index + 1}</td>
                      <td className="fw-semibold">{dro.date}</td>
                      <td><Badge bg="primary">{dro.time}</Badge></td>
                      <td>
                        <Badge bg="warning" className="fw-bold px-3">
                          {dro.order?.[0]?.name || 'N/A'}
                        </Badge>
                      </td>
                      <td><Badge bg="secondary">{dro.totalMembers}</Badge></td>
                      <td>
                        <Badge bg="info" className="px-3 py-2 fw-bold">
                          <FaClock className="me-1" />
                          {getTimerDisplay(dro)}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="fw-bold" onClick={() => viewDro(dro)}>
                          <FaEye className="me-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* 🔥 MODALS - REMAINS SAME */}
        {/* DRO RESULT MODAL */}
        <Modal show={showDroModal} onHide={() => setShowDroModal(false)} size="l" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="fw-bold h3">🎯 DRO Results</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedDro && (
              <Alert variant="info" className="mb-4 text-center p-4 shadow">
                <FaClock className="me-3 fs-3 text-primary" />
                <span className="fs-4 fw-bold">Auto-delete:</span>
                <span className="h2 text-primary fw-bold">
                  {getTimerDisplay(selectedDro)}
                </span>
              </Alert>
            )}
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-warning">
                  <tr>
                    <th className="fs-5">Position</th>
                    <th className="fs-5">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDro?.order?.map((item, i) => (
                    <tr key={i} className={i === 0 ? 'table-warning' : ''}>
                      <td className={`fw-bold fs-3 text-center ${i === 0 ? 'text-warning' : ''}`}>
                        {item.position}{item.suffix}
                      </td>
                      <td className={`fw-bold fs-2 ${i === 0 ? 'text-warning' : ''}`}>
                        {item.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="lg" onClick={() => setShowDroModal(false)}>
              Close
            </Button>
            <Button variant="primary" size="lg" onClick={copyDro}>
              <FaCopy className="me-2" /> Copy Results
            </Button>
          </Modal.Footer>
        </Modal>

        {/* TIMER MODAL & CONFIRM MODAL - SAME AS ORIGINAL */}
        <Modal show={showTimerModal} onHide={() => setShowTimerModal(false)} centered size="sm">
          <Modal.Header closeButton className="bg-light text-dark border-bottom">
            <Modal.Title className="fw-bold">
              <FaClock className="me-2 text-primary" /> Set Global Timer
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-4">
            <h4 className="mb-4 text-dark fw-bold">DRO auto-delete after:</h4>
            <div className="row g-3 justify-content-center mb-4">
              <div className="col-4">
                <input
                  type="number"
                  className="form-control form-control-lg text-center fw-bold text-primary border-primary"
                  style={{ height: '60px', fontSize: '1.5rem' }}
                  value={globalTimer.hours}
                  onChange={(e) => handleTimerChange('hours', e.target.value)}
                  min="0" max="23"
                />
                <div className="text-muted fw-bold mt-1 small">Hours</div>
              </div>
              <div className="col-4">
                <input
                  type="number"
                  className="form-control form-control-lg text-center fw-bold text-warning border-warning"
                  style={{ height: '60px', fontSize: '1.5rem' }}
                  value={globalTimer.minutes}
                  onChange={(e) => handleTimerChange('minutes', e.target.value)}
                  min="0" max="59"
                />
                <div className="text-muted fw-bold mt-1 small">Minutes</div>
              </div>
              <div className="col-4">
                <input
                  type="number"
                  className="form-control form-control-lg text-center fw-bold text-info border-info"
                  style={{ height: '60px', fontSize: '1.5rem' }}
                  value={globalTimer.seconds}
                  onChange={(e) => handleTimerChange('seconds', e.target.value)}
                  min="0" max="59"
                />
                <div className="text-muted fw-bold mt-1 small">Seconds</div>
              </div>
            </div>
            <div className="alert alert-info shadow p-4 mb-3">
              <h5 className="mb-0 fw-bold text-center text-primary">PREVIEW:</h5>
              <div className="h2 fw-bold text-primary mt-2">
                {safeToString(globalTimer.hours)} : {safeToString(globalTimer.minutes)} : {safeToString(globalTimer.seconds)}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="lg" onClick={() => setShowTimerModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              className="px-5 fw-bold"
              onClick={handleSetGlobalTimer}
              disabled={timerLoading || !timerSet}
            >
              {timerLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Setting...
                </>
              ) : (
                '🚀 SET TIMER'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="md">
          <Modal.Header closeButton className="bg-light text-dark border-bottom">
            <Modal.Title className="fw-bold h5">
              {confirmAction === 'assign' ? 'Grant Access' : 'Remove Access'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <h3 className="mb-3 fw-bold text-capitalize">{confirmMemberName}</h3>
            <h5>{confirmAction === 'assign' ? 'Grant DRO Access?' : 'Remove DRO Access?'}</h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="lg" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              size="lg"
              variant={confirmAction === 'assign' ? "primary" : "outline-danger"} 
              className="px-4 fw-bold"
              onClick={handleConfirmAction}
              disabled={droUsersLoading}
            >
              {droUsersLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  </Container>
);

};

export default Dro;
