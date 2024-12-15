'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Switch,
  Modal,
  Space,
  message,
  Popconfirm
} from 'antd';
import moment from 'moment';

const { Option } = Select;

const TaskManagementApp = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();

  axios.defaults.baseURL = 'https://675ed2261f7ad2426996be13.mockapi.io';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      message.error('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  

  const handleAddTask = async (values) => {
    try {
      const response = await axios.post('/tasks', values);
      setTasks((prev) => [...prev, response.data]);
      message.success('Task added successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to add task.');
    }
  };

  const handleEditTask = async (id, values) => {
    try {
      const response = await axios.put(`/tasks/${id}`, values);
      setTasks((prev) => prev.map((task) => (task.id === id ? response.data : task)));
      message.success('Task updated successfully!');
    } catch (error) {
      message.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      message.success('Task deleted successfully!');
    } catch (error) {
      message.error('Failed to delete task.');
    }
  };

  const openModal = (task) => {
    setCurrentTask(task || null);
    setIsModalOpen(true);
    if (task) {
      form.setFieldsValue({
        ...task,
        dueDate: moment(task.dueDate),
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFormSubmit = (values) => {
    const formattedValues = {
      ...values,
      dueDate: values.dueDate.format('YYYY-MM-DD'),
    };
    if (currentTask) {
      handleEditTask(currentTask.id, formattedValues);
    } else {
      handleAddTask(formattedValues);
    }
    closeModal();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    {
      title: 'Task Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status ? 'Completed' : 'Not Completed'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='w-full max-w-[1360px] p-[20px] mx-auto'>
      <h1 className='text-[30px]'>Task Management App</h1>
      <button className='border py-[5px] px-[8px] font-semibold rounded bg-[#096dd9] text-[#fff]  '  onClick={() => openModal()}>Add Task</button>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        style={{ marginTop: '20px' }}
      />

      <Modal
        title={currentTask ? 'Edit Task' : 'Add Task'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter a task title.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select a priority.' }]}
          >
            <Select>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select a due date.' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Completed" unCheckedChildren="Not Completed" />
          </Form.Item>
          <Form.Item>
            <button className='border py-[5px] px-[8px] font-semibold rounded bg-[#096dd9] text-[#fff]  ' type="submit">
              {currentTask ? 'Update Task' : 'Add Task'}
            </button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default TaskManagementApp;
