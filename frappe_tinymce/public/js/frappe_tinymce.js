
frappe.ui.form.ControlTextEditor = class ControlTextEditor extends frappe.ui.form.ControlCode {
    make_wrapper() {
        super.make_wrapper();
    }

    make_input() {
        this.has_input = true;
        this.make_quill_editor();
    }

    make_quill_editor() {
        // if (this.quill) return;
        // this.quill = new Quill(this.quill_container[0], this.get_quill_options());
        // this.bind_events();
        const that = this
        this.quill_container = $('<div>').appendTo(this.input_area);
        tinymce.init({
            target: this.input_area,
            toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist  | forecolor backcolor removeformat | pagebreak | charmap media link | image',font_size_formats: '10px 11px 12px 14px 15px 16px 18px 24px 36px',
            plugins: [
              'autoresize', 'autolink', 'charmap', 'emoticons', 'fullscreen', 'help',
              'image', 'media', 'link', 'lists', 'searchreplace',
              'table', 'visualblocks', 'visualchars',
            ],
            paste_data_images: true,
            menubar: 'edit view insert format table',
            powerpaste_googledocs_import: "prompt",
            entity_encoding: 'raw',
            convert_urls: true,
            content_css: false,
            toolbar_sticky: false,
            promotion: false,
            statusbar: false,
            // without images_upload_url set, Upload tab won't show up
            images_upload_url: 'upload.php',
            
            // override default upload handler to simulate successful upload
            images_upload_handler: image_upload_handler_callback,

            setup: function(editor) {
                that.editor_id = editor.id
                editor.on('Change', function(e) {
                    that.parse_validate_and_set_in_model(e.level.content);
                });
                editor.on('init', function (e) {
                    editor.setContent(that.value);
                });
            }
        });
        this.activeEditor = tinymce.activeEditor
    }

    set_formatted_input(value){
        if (this.frm && !this.frm.doc.__setContent){
            if(value){
                this.activeEditor.setContent(value)
            }else{
                this.activeEditor.setContent("")
            }
        }
        this.frm.doc.__setContent = 1

    }
}

const image_upload_handler_callback = (blobInfo, progress) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', '/api/method/upload_file');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('X-Frappe-CSRF-Token', frappe.csrf_token);    
    
    xhr.upload.onprogress = (e) => {
        progress(e.loaded / e.total * 100);
    };
    
    xhr.onload = () => {
        if (xhr.status === 403) {
            reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
            return;
        }
      
        if (xhr.status < 200 || xhr.status >= 300) {
            reject('HTTP Error: ' + xhr.status);
            return;
        }
      
        const json = JSON.parse(xhr.responseText);
        console.log(json);
        resolve(json.message.file_url);
    };
    
    xhr.onerror = () => {
      reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
    };
    
    const formData = new FormData();
    formData.append('is_private', 0);
    formData.append('folder', "Home");    
    formData.append('file', blobInfo.blob(), blobInfo.filename());
    
    xhr.send(formData);
});
