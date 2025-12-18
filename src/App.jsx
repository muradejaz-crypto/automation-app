import React, { useMemo, useState } from 'react';
import { Layout, Card, Typography, Button, Space, message, Row, Col, Divider } from 'antd';
import axios from 'axios';
import './styles.css';

const { Title, Paragraph, Text } = Typography;
// Default to localhost - change VITE_AUTOMATION_SERVER_URL env var if needed
// Remove trailing slash to avoid double slashes in URLs
const BASE_URL = (import.meta.env.VITE_AUTOMATION_SERVER_URL || 'http://localhost:3001').replace(/\/$/, '');

const flows = [
  { key: 'login', label: 'Login (Playwright)', endpoint: '/api/automation/run-login' },
  { key: 'signup', label: 'Signup Test (Playwright)', endpoint: '/api/automation/run-student-full-flow' },
  { key: 'testCreation', label: 'Test Creation Automation', endpoint: '/api/automation/run-test-creation' },
  { key: 'courseCreation', label: 'Course Creation Automation', endpoint: '/api/automation/run-course-creation' },
  { key: 'purchase', label: 'Purchase Premium Course', endpoint: '/api/automation/run-purchase' },
  { key: 'socialSignup', label: 'Social Signup (Playwright)', endpoint: '/api/automation/run-social-signup' },
  { key: 'studentFull', label: 'Student Full Flow', endpoint: '/api/automation/run-student-full-flow' },
  { key: 'liveClass', label: 'Live Class API', endpoint: '/api/automation/run-live-class', headed: false },
];

function App() {
  const [loading, setLoading] = useState({});
  const [healthOk, setHealthOk] = useState(null);

  const flowMap = useMemo(() => Object.fromEntries(flows.map((f) => [f.key, f])), []);

  const checkHealth = async () => {
    try {
      // Ensure /health endpoint is properly constructed
      const healthUrl = `${BASE_URL}/health`;
      const res = await axios.get(healthUrl, { timeout: 4000 });
      if (res.status === 200) {
        setHealthOk(true);
        message.success('Automation server is reachable.');
        return true;
      }
    } catch (err) {
      setHealthOk(false);
      const detail = err?.message || 'Automation server is not reachable.';
      message.error(`${detail}\nPlease ensure server is running at ${BASE_URL}`);
    }
    return false;
  };

  const runFlow = async (key) => {
    const flow = flowMap[key];
    if (!flow) return;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      if (!(await checkHealth())) {
        return;
      }
      const body = { headed: flow.headed !== false };
      // Ensure endpoint starts with / to avoid double slashes
      const endpoint = flow.endpoint.startsWith('/') ? flow.endpoint : `/${flow.endpoint}`;
      const res = await axios.post(`${BASE_URL}${endpoint}`, body, { timeout: 1000 * 60 * 10 });
      if (res.data?.success !== false) {
        message.success(`${flow.label} completed`);
      } else {
        message.error(res.data?.message || `${flow.label} failed`);
      }
      if (res.data?.output) console.log(res.data.output);
      if (res.data?.errors) console.warn(res.data.errors);
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.message || err?.message || 'Unknown error';
      message.error(`${flow.label} failed: ${detail}`);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const healthStatus = healthOk === null ? 'Unknown' : healthOk ? 'Healthy' : 'Unreachable';

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px', background: '#f5f6f8' }}>
      <Layout.Content>
        <Card>
          <Title level={2}>Automation Framework (React)</Title>
          <Paragraph>Triggers Playwright automations via the existing automation server at {BASE_URL}.</Paragraph>
          <Paragraph>
            <Text strong>Health:</Text> {healthStatus}
          </Paragraph>
          <Button onClick={checkHealth}>Check Server Health</Button>
        </Card>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Card title="Login Test" bordered={false}>
              <Paragraph>Automate sign-in with predefined credentials.</Paragraph>
              <Button type="primary" loading={loading.login} onClick={() => runFlow('login')}>
                Login Test
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title="Signup Test" bordered={false}>
              <Paragraph>Full signup automation (email flow).</Paragraph>
              <Button loading={loading.signup} onClick={() => runFlow('signup')}>
                Signup Test
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title="Test Creation" bordered={false}>
              <Paragraph>Automates instructor test creation.</Paragraph>
              <Space>
                <Button loading={loading.testCreation} onClick={() => runFlow('testCreation')}>
                  Test Creation Automation
                </Button>
                <Button type="primary" loading={loading.courseCreation} onClick={() => runFlow('courseCreation')}>
                  Course Creation Automation
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Card title="Social Signup" bordered={false}>
              <Paragraph>Triggers Google social signup flow.</Paragraph>
              <Button loading={loading.socialSignup} onClick={() => runFlow('socialSignup')}>
                Social Signup (Playwright)
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title="Purchase Premium Course" bordered={false}>
              <Paragraph>Runs the premium course purchase Playwright flow.</Paragraph>
              <Button loading={loading.purchase} onClick={() => runFlow('purchase')}>
                Purchase Premium Course
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title="Student Full Flow" bordered={false}>
              <Paragraph>Runs end-to-end student journey.</Paragraph>
              <Button loading={loading.studentFull} onClick={() => runFlow('studentFull')}>
                Student Full Flow
              </Button>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Card title="Live Class API" bordered={false}>
              <Paragraph>Exercises live class API through the automation server.</Paragraph>
              <Button loading={loading.liveClass} onClick={() => runFlow('liveClass')}>
                Live Class API
              </Button>
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}

export default App;
