/**
 * Rich Text Editor Component
 * Wrapper around ReactQuill for rich text editing
 * Properly handles content loading, editing, and saving
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

// Ensure Quill styles are loaded
if (typeof window !== 'undefined') {
  // Dynamically import Quill CSS if not already loaded
  const quillCSS = document.querySelector('link[href*="quill.snow.css"]');
  if (!quillCSS) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
    document.head.appendChild(link);
  }
}

const RichTextEditor = ({ value, onChange, placeholder, error }) => {
  const quillRef = useRef(null);
  // Initialize with value prop - this ensures content loads correctly
  const [editorValue, setEditorValue] = useState(value || '');
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Configure toolbar - comprehensive formatting options (image upload disabled)
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }], // Headings (H1, H2, H3, Normal)
        ['bold', 'italic', 'underline', 'strike'], // Text formatting
        [{ 'color': [] }, { 'background': [] }], // Text and background colors
        [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Ordered and bullet lists
        [{ 'align': [] }], // Text alignment (left, center, right, justify)
        ['link'], // Insert links (image removed)
        ['blockquote', 'code-block'], // Blockquotes and code blocks
        ['clean'] // Remove all formatting
      ],
    },
  };

  // All formats that are allowed in the editor (image removed)
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link',
    'blockquote', 'code-block'
  ];


  // Handle editor changes
  const handleChange = useCallback((content, delta, source, editor) => {
    // Skip if this change is from our programmatic update
    if (editor?.root?.getAttribute('data-updating') === 'true') {
      return;
    }
    
    // Get HTML content from editor
    const htmlContent = editor.getHTML();
    setEditorValue(htmlContent);
    
    // Notify parent component
    if (onChange) {
      onChange(htmlContent);
    }
  }, [onChange]);

  // Sync editorValue with value prop changes (when loading existing post)
  useEffect(() => {
    const newValue = value || '';
    // Always sync when value prop changes (this happens when loading a post)
    if (newValue !== editorValue) {
      setEditorValue(newValue);
    }
  }, [value]);

  // Update editor content when editorValue changes (but not from user typing)
  useEffect(() => {
    if (quillRef.current?.getEditor) {
      const editor = quillRef.current.getEditor();
      const currentContent = editor.root.innerHTML;
      const newContent = editorValue || '<p><br></p>';
      
      // Only update if content is actually different (prevents loops)
      if (currentContent !== newContent) {
        // Use a flag to prevent triggering onChange during programmatic update
        const wasUpdating = editor.root.getAttribute('data-updating');
        if (!wasUpdating) {
          editor.root.setAttribute('data-updating', 'true');
          editor.root.innerHTML = newContent;
          // Remove flag after a short delay
          setTimeout(() => {
            editor.root.removeAttribute('data-updating');
          }, 100);
        }
      }
    }
  }, [editorValue]);

  // Initialize editor and add tooltips
  useEffect(() => {
    let timer;
    let observer;

    // Wait a bit for ReactQuill to fully initialize
    timer = setTimeout(() => {
      if (quillRef.current && quillRef.current.getEditor) {
        const editor = quillRef.current.getEditor();
        
        if (!editor) {
          console.error('Editor not found');
          return;
        }

        // Ensure editor is enabled and editable
        editor.enable(true);
        
        // Make sure editor root is visible and interactive
        if (editor.root) {
          editor.root.style.pointerEvents = 'auto';
          editor.root.style.cursor = 'text';
          editor.root.setAttribute('contenteditable', 'true');
        }

        const toolbar = editor.getModule('toolbar');
        
        if (toolbar && toolbar.container) {
          // Ensure toolbar is visible
          toolbar.container.style.visibility = 'visible';
          toolbar.container.style.display = 'flex';
          toolbar.container.style.opacity = '1';
          toolbar.container.style.pointerEvents = 'auto';
          toolbar.container.style.borderTopLeftRadius = 'var(--radius-md)';
          toolbar.container.style.borderTopRightRadius = 'var(--radius-md)';

          // Set initial content if available and editor is empty
          const currentHtml = editor.root.innerHTML.trim();
          if (editorValue && (currentHtml === '<p><br></p>' || currentHtml === '' || !currentHtml)) {
            editor.root.innerHTML = editorValue;
          }

          // Function to add tooltips
          const addTooltips = () => {
            const tooltipMap = {
              'ql-bold': 'Bold (Ctrl+B)',
              'ql-italic': 'Italic (Ctrl+I)',
              'ql-underline': 'Underline (Ctrl+U)',
              'ql-strike': 'Strikethrough',
              'ql-link': 'Insert Link',
              'ql-image': 'Insert Image',
              'ql-blockquote': 'Quote',
              'ql-code-block': 'Code Block',
              'ql-clean': 'Clear Formatting',
            };

            // Add tooltips to buttons
            const buttons = toolbar.container.querySelectorAll('button:not(.ql-picker-label)');
            buttons.forEach((button) => {
              button.style.visibility = 'visible';
              button.style.opacity = '1';
              button.style.display = 'inline-block';
              const className = button.className || '';
              for (const [key, tooltip] of Object.entries(tooltipMap)) {
                if (className.includes(key)) {
                  button.setAttribute('title', tooltip);
                  break;
                }
              }
            });

            // Add tooltips to picker labels
            const pickerLabels = toolbar.container.querySelectorAll('.ql-picker-label');
            pickerLabels.forEach((label) => {
              label.style.visibility = 'visible';
              label.style.opacity = '1';
              const className = label.parentElement?.className || '';
              if (className.includes('ql-header')) {
                label.setAttribute('title', 'Heading Size');
              } else if (className.includes('ql-color') && !className.includes('ql-background')) {
                label.setAttribute('title', 'Text Color');
              } else if (className.includes('ql-background')) {
                label.setAttribute('title', 'Background Color');
              } else if (className.includes('ql-align')) {
                label.setAttribute('title', 'Text Alignment');
              } else if (className.includes('ql-list')) {
                label.setAttribute('title', 'List');
              }
            });

            // Add tooltips to picker options
            const pickerOptions = toolbar.container.querySelectorAll('.ql-picker-item');
            pickerOptions.forEach((option) => {
              option.style.visibility = 'visible';
              option.style.opacity = '1';
              const dataValue = option.getAttribute('data-value');
              const parentClass = option.closest('.ql-picker')?.className || '';
              
              if (parentClass.includes('ql-header')) {
                if (dataValue === '1') option.setAttribute('title', 'Heading 1');
                else if (dataValue === '2') option.setAttribute('title', 'Heading 2');
                else if (dataValue === '3') option.setAttribute('title', 'Heading 3');
                else if (dataValue === false || dataValue === '') option.setAttribute('title', 'Normal Text');
              } else if (parentClass.includes('ql-list')) {
                if (dataValue === 'ordered') option.setAttribute('title', 'Numbered List');
                else if (dataValue === 'bullet') option.setAttribute('title', 'Bullet List');
              } else if (parentClass.includes('ql-align')) {
                if (dataValue === '') option.setAttribute('title', 'Align Left');
                else if (dataValue === 'center') option.setAttribute('title', 'Align Center');
                else if (dataValue === 'right') option.setAttribute('title', 'Align Right');
                else if (dataValue === 'justify') option.setAttribute('title', 'Justify');
              }
            });
          };

          // Add tooltips initially
          setTimeout(addTooltips, 100);

          // Use MutationObserver to add tooltips to dynamically added elements
          observer = new MutationObserver(() => {
            addTooltips();
          });

          observer.observe(toolbar.container, {
            childList: true,
            subtree: true,
            attributes: false
          });
        } else {
          console.error('Toolbar not found in ReactQuill');
        }
      }
    }, 100);

    // Cleanup function
    return () => {
      if (timer) clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, []);

  // Check if ReactQuill is available
  if (!ReactQuill) {
    return (
      <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
        <p style={{ color: 'red' }}>Error: ReactQuill is not loaded. Please ensure react-quill is installed.</p>
        <p style={{ fontSize: '14px', color: '#666' }}>Run: npm install react-quill</p>
      </div>
    );
  }

  return (
    <div className="rich-text-editor-wrapper" style={{ width: '100%', position: 'relative' }}>
      <div style={{ width: '100%' }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorValue || ''}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || 'Write your content here...'}
          readOnly={false}
          bounds=".rich-text-editor-wrapper"
        />
      </div>
      {error && <span className="error" style={{ marginTop: 'var(--space-2)', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default RichTextEditor;
