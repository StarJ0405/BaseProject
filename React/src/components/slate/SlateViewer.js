import React, { useMemo, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
// import { jsx } from 'slate-hyperscript';
import style from './SlateViewer.module.css';

// HTML을 Slate 노드로 변환하는 유틸리티 함수들
const deserializeHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return deserializeNode(doc.body);
};

const deserializeNode = (node) => {
    if (node.nodeType === 3) {
        return { text: node.textContent };
    }

    if (node.nodeType !== 1) {
        return null;
    }

    const children = Array.from(node.childNodes)
        .map(deserializeNode)
        .flat()
        .filter(Boolean);

    switch (node.nodeName.toLowerCase()) {
        case 'p':
            return {
                type: 'paragraph',
                children: children.length ? children : [{ text: '' }],
            };
        case 'img':
            return {
                type: 'image',
                url: node.getAttribute('src'),
                children: [{ text: '' }],
            };
        default:
            return children;
    }
};

// 이미지 엘리먼트 컴포넌트
const ImageElement = ({ attributes, children, element }) => {
    return (
        <figure {...attributes} className={style.imageContainer}>
            <div contentEditable={false}>
                <img
                    src={element.url}
                    alt=""
                    className={style.image}
                />
            </div>
            {children}
        </figure>
    );
};

// 메인 SlateViewer 컴포넌트
const SlateViewer = ({ content, className = '' }) => {
    const editor = useMemo(() => withReact(createEditor()), []);

    const initialValue = useMemo(() => {
        if (!content) return [{ type: 'paragraph', children: [{ text: '' }] }];
        const nodes = deserializeHTML(content);
        return Array.isArray(nodes) ? nodes : [nodes];
    }, [content]);

    const renderElement = useCallback(props => {
        switch (props.element.type) {
            case 'image':
                return <ImageElement {...props} />;
            default:
                return (
                    <span {...props.attributes} className={style.paragraph}>
                        {props.children}
                    </span>
                );
        }
    }, []);

    return (
        <div className={`${style.container} ${className}`}>
            <Slate editor={editor} initialValue={initialValue}>
                <Editable
                    readOnly
                    renderElement={renderElement}
                    className={style.content}
                />
            </Slate>
        </div>
    );
};

export default SlateViewer;