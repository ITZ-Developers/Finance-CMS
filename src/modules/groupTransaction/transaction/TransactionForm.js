import { Card, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { kindOptions, stateOptions, stateTransactionOptions, statusOptions } from '@constants/masterData';
import NumericField from '@components/common/form/MoneyField';

const message = defineMessages({
    objectName: 'group permission',
});

const TransactionForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing } = props;
    const [categoryId, setCategoryId] = useState(dataDetail?.kind);
    const [kind, setKind] = useState(dataDetail?.kind);
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const { execute: executeCategory, data: categoryData } = useFetch(apiConfig.category.autocomplete, {
        immediate: false,
        mappingData: (data) => data.data.content.map(item => ({
            value: item.id,
            label: item.name,
        })),
    });
    useEffect(() => {
        // const categoryItem = categoryData && categoryData.find((item) => item.id === categoryId);
        // if (categoryItem) {
        //     form.setFieldValue('kind', categoryItem.kind);
        // }
        executeCategory({
            params: { kind: kind },
        });
    }, [kind]);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({ ...values });
    };
    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
                state: stateValues[0].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            kind: dataDetail?.kind,
            categoryId: dataDetail?.category?.id,
        });
    }, [dataDetail]);
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField required label={translate.formatMessage(commonMessage.name)} name="name" />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="kind"
                            label={translate.formatMessage(commonMessage.kind)}
                            required
                            options={kindValues}
                            onChange={(data) => {
                                setKind(data);
                                form.setFieldValue('categoryId', null);
                            }}
                            disabled={isEditing}
                        />
                    </Col>

                    <Col span={12}>
                        {/* <TextField required label={translate.formatMessage(commonMessage.money)} name="money"/> */}
                        <NumericField
                            label={<FormattedMessage defaultMessage={'Tổng tiền'} />}
                            name="money"
                            min={0}
                            // max={withdrawMoney}
                            addonAfter="₫"
                            defaultValue={0}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="categoryId"
                            label={translate.formatMessage(commonMessage.category)}
                            required
                            options={categoryData}
                            disabled={!kind && !dataDetail?.kind}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="state"
                            label={translate.formatMessage(commonMessage.state)}
                            required
                            options={stateValues}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.note)}
                            name="note"
                            type="textarea"
                        />
                    </Col> 
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default TransactionForm;
