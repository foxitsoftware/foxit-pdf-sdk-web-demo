import * as React from 'react';
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import Modal from "antd/lib/modal/Modal";

export function PasswordDialog(props: {
    visible: boolean;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}) {
    const [form] = useForm()

    return <Modal
        className="fx_oc-modal"
        title="Password"
        open={props.visible}
        onOk={form.submit}
        onCancel={() => {
            form.resetFields();
            props.onCancel();
        }}
    >
        <Form
            form={form}
            layout="vertical"
            onFinish={values => {
                props.onSubmit(values.password);
            }}
        >
            <Form.Item
                label="Please input password"
                required={true}
                name="password"
            >
                <Input type="password"></Input>
            </Form.Item>
        </Form>
    </Modal>
}