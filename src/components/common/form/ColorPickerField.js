import React, { useEffect, useMemo, useState } from 'react';
import { Button, ColorPicker, Flex, Form, Input, Tooltip } from 'antd';
import useFormField from '@hooks/useFormField';
import { ReloadOutlined } from '@ant-design/icons';
import RefeshIcon from '@assets/icons/refresh.svg';

const ColorPickerField = ({
    label,
    name,
    formItemProps,
    fieldProps,
    form,
    defaultColor,
    openModal,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(defaultColor);
    const handleDivClick = () => {
        setOpen(true);
    };
    const { rules } = useFormField(props);
    useEffect(() => {
        setColor(defaultColor);
        form.setFieldValue(name, defaultColor);
    }, [ openModal ]);

    return (
        <Form.Item label={label} name={name} validateFirst rules={rules} initialValue={color} {...formItemProps}>
            <Flex style={{ position: 'relative' }} gap={8}>
                <div
                    style={{
                        backgroundColor: `${color}`,
                        height: 32,
                        borderRadius: '6px',
                        width: '70%',
                        zIndex: 100,
                        position: 'relative',
                        cursor: 'pointer',
                    }}
                    onClick={handleDivClick}
                />
                <ColorPicker
                    value={color}
                    open={open}
                    onOpenChange={setOpen}
                    onChange={(newColor) => {
                        form.setFieldValue(name, newColor.toHexString());
                        setColor(newColor.toHexString());
                    }}
                    showText
                    style={{ width: '70%', height: 28, zIndex: 1, position: 'absolute' }}
                    format={'hex'}
                    mode={'gradient'}
                />
                <Tooltip title={'Generate Color'} placement="bottom">
                    <Button
                        style={{ position: 'relative', display: 'block' }}
                        icon={<img src={RefeshIcon} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            const color = generateColor();
                            setColor(color);
                            form.setFieldValue(name, color);
                        }}
                    />
                </Tooltip>
            </Flex>
        </Form.Item>
    );
};

function generateColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`; // Đảm bảo mã màu có 6 ký tự
}

export default ColorPickerField;
