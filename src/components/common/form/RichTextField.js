import { Form } from 'antd';
import React from 'react';
import useFormField from '@hooks/useFormField';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6
import { showErrorMessage } from '@services/notifyService';
import { AppConstants, LIMIT_IMAGE_SIZE, UploadFileTypes } from '@constants';

const AlignStyle = ReactQuill.Quill.import('attributors/style/align');
ReactQuill.Quill.register(AlignStyle, true);

function getLoader() {
    const div = document.createElement('div');
    div.className = 'loader-container';
    div.innerHTML = "<div class='loader'>Loading...</div>";
    return div;
}

const formats = [
    'header',
    'font',
    'size',
    'color',
    'background',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'align',
    'list',
    'bullet',
    'indent',
    'image',
];

const RichTextField = (props) => {
    const { label, disabled, name, required, style, labelAlign, formItemProps, defaultValue } = props;

    const modules = {
        toolbar: {
            container: [
                [ { header: [ 1, 2, 3, false ] } ],
                [ { color: [] }, { background: [] } ],
                [ 'bold', 'italic', 'underline', 'strike', 'blockquote' ],
                [ { align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' } ],
                [ { list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' } ],
                [ 'image' ],
                [ 'clean' ],
            ],
            // handlers: {
            //     // handlers object will be merged with default handlers object
            //     image: imageHandler,
            // },
        },
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        },
    };

    const { rules } = useFormField(props);

    // const imageHandler = () => {
    //     const { uploadFile, baseUrlImage, t } = props;
    //     const _this3 = quillRef.editor;
    //     let fileInput = _this3.container.querySelector('input.ql-image[type=file]');
    //     if (fileInput == null) {
    //         fileInput = document.createElement('input');
    //         fileInput.setAttribute('type', 'file');
    //         fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
    //         fileInput.classList.add('ql-image');
    //         fileInput.addEventListener('change', function () {
    //             if (fileInput.files != null && fileInput.files[0] != null) {
    //                 const size = fileInput.files[0].size;
    //                 const file = fileInput.files[0];
    //                 if (size < LIMIT_IMAGE_SIZE) {
    //                     const loader = getLoader();
    //                     _this3.container.appendChild(loader);
    //                     _this3.container.classList.add('disabled');
    //                     _this3.container.firstChild.setAttribute('contenteditable', false);
    //                     uploadFile({
    //                         params: { fileObjects: { file }, type: UploadFileTypes.AVATAR },
    //                         others: baseUrlImage ? { path: baseUrlImage + '/v1/file/upload' } : null,
    //                         onCompleted: (result) => {
    //                             const index = _this3.getSelection(true).index;
    //                             if (baseUrlImage) {
    //                                 _this3.insertEmbed(
    //                                     index,
    //                                     'image',
    //                                     `${baseUrlImage + '/v1/file/download'}${result.data.filePath}`,
    //                                 );
    //                             } else {
    //                                 _this3.insertEmbed(
    //                                     index,
    //                                     'image',
    //                                     `${AppConstants.mediaRootUrl}${result.data.filePath}`,
    //                                 );
    //                             }
    //                             _this3.setSelection(index + 1);
    //                             fileInput.value = '';
    //                             _this3.container.removeChild(loader);
    //                             _this3.container.classList.remove('disabled');
    //                             _this3.container.firstChild.setAttribute('contenteditable', true);
    //                             _this3.container.firstChild.focus();
    //                         },
    //                         onError: (err) => {
    //                             if (err && err.message) {
    //                                 showErrorMessage(err.message);
    //                             }
    //                             _this3.container.removeChild(loader);
    //                             _this3.container.classList.remove('disabled');
    //                             _this3.container.firstChild.setAttribute('contenteditable', true);
    //                             _this3.container.firstChild.focus();
    //                         },
    //                     });
    //                 } else {
    //                     showErrorMessage(t('imageTooLarge'));
    //                 }
    //             }
    //         });
    //         _this3.container.appendChild(fileInput);
    //     }
    //     fileInput.click();
    // };

    return (
        <Form.Item
            {...formItemProps}
            required={required}
            labelAlign={labelAlign}
            name={name}
            label={label}
            rules={rules}
            initialValue=""
        >
            <ReactQuill
                style={style}
                formats={formats}
                modules={modules}
                readOnly={disabled}
            />
        </Form.Item>
    );
};

export default RichTextField;
