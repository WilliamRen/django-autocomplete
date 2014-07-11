
  if (typeof window.quickElement == 'undefined') {
    // quickElement(tagType, parentReference [, textInChildNode, attribute, attributeValue ...]);
    function quickElement() {
        var obj = document.createElement(arguments[0]);
        if (arguments[2]) {
            var textNode = document.createTextNode(arguments[2]);
            obj.appendChild(textNode);
        }
        var len = arguments.length;
        for (var i = 3; i < len; i += 2) {
            obj.setAttribute(arguments[i], arguments[i+1]);
        }
        arguments[1].appendChild(obj);
        return obj;
    }
  }

  function AutocompleteBase(source, field_id, field_name, field_title) {
    this.source = source;
    this.field_id = field_id;
    this.field_name = field_name;
    this.field_title = field_title;

    // the following are set in the `buildModal` method
    this.modal = null;
    this.input = null;
    this.spinner = null;
    this.items = null;
    this.inline_id = null; // set with inline forms
  }

  AutocompleteBase.prototype.initBase = function() {
    this.buildModal(this.field_name, this.field_title);
    $(this.spinner).hide();
  }

  AutocompleteBase.prototype.focusInput = function(input) {
    // bootstrap event modal.on('shown.bs.modal') is not triggered 
    // (because of way the modal is created??)
    $(input).val('');
    $(input).focus();
  }

  AutocompleteBase.prototype.setTrigger = function(el, action) {
    $(el).on(action,
      {obj: this},
      function(event) {
        var obj = event.data.obj;
        console.log(obj)
        console.log(obj.input)
        console.log(obj.modal)
        $(obj.modal).modal('show');
        setTimeout(
          function() {
            obj.focusInput(obj.input);
          },
          200);
        event.preventDefault();
        return false;
      }
    );
  }

  AutocompleteBase.prototype.initAutocomplete = function() {
    // create actual jqueryui autocomplete plugin object
    // note the the `select` method is not defined - this is for the child classes
    $(this.input).autocomplete({
      source: '/' + this.source,
      minLength: 1,
      delay: 300,
      appendTo: this.items,
      search: function(event, ui) {
        $(this.spinner).show();
      },
      response: function(event, ui) {
        $(this.spinner).hide();
        if($('#filter-items span:first').length) {
          $('#filter-items span:first').remove();
        }
        if (!ui.content.length) {
          $('#filter-items').prepend('<span class="text-muted">No results found.<span>');
        }
      },
      change: function(event, ui) {
        $(this.modal).modal('hide');
        event.preventDefault();
        return false;
      }
    });
  }

  AutocompleteBase.prototype.buildModal = function() {
    // build the modal into the dom
    this.modal = quickElement('div', document.body, false,
         'id', this.field_name + '_modal',
         'class', 'modal fade',
         'style', 'width:560px;margin: 20px auto 0 auto;',
         'tabindex', '-1',
         'role', 'dialog',
         'aria-hidden', 'true');
    var modal_content = quickElement('div', this.modal, false,
         'class', 'modal-content');
    var modal_header = quickElement('div', modal_content, false,
         'class', 'modal-header');
    var button = quickElement('button', modal_header, false,
         'class', 'close',
         'data-dismiss', 'modal');
    var hide = quickElement('span', button, 'x',
         'aria-hidden', 'true');
    var header = quickElement('h3', modal_header, 'Search in: ' + this.field_title,
         'class', 'text-center');
    var header_title = quickElement('span', header, '',
         'id', this.field_name + '_title');
    var modal_body = quickElement('div', modal_content, false,
         'class', 'modal-body');
    var modal_body_group = quickElement('div', modal_body, false,
         'class', 'form-group has-feedback');
    var label = quickElement('label', modal_body_group, 'Search',
         'class', 'hidden sr-only',
         'for', this.field_name + '_autocomplete');
    this.input = quickElement('input', modal_body_group, false,
         'class', 'form-control',
         'id', this.field_name + '_autocomplete',
         'type', 'text',
         'placeholder', 'Start typing ...');
    this.spinner = quickElement('span', modal_body_group, false,
         'class', 'group-addon',
         'id', this.field_name + '_spinner');
    var spinner_obj = quickElement('i', this.spinner, false,
         'class', 'glyphicon glyphicon-refresh spin form-control-feedback');
    this.items = quickElement('div', modal_body, false,
         'id', this.field_name + '_items',
         'class', 'filter-items');
  }