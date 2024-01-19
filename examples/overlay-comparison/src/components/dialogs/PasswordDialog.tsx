import * as React from 'react';
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import Modal from "antd/lib/modal/Modal";
import { useTranslation } from "react-i18next";

export function PasswordDialog(props: {
    visible: boolean;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}) {
    const { t } = useTranslation('translation', {keyPrefix: 'OverlayComparison'});
    const [form] = useForm()

    return <Modal
        className="fx_oc-modal"
        title={t("Password")}
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
                label={t("Please input password")}
                required={true}
                name="password"
            >
                <Input type="password"></Input>
            </Form.Item>
        </Form>
    </Modal>
}