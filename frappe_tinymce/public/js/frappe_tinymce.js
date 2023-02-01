
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
            toolbar_sticky: true,
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
