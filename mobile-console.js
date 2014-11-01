(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.mobileConsole = factory();
	}
})(this, function () {

	var containerHtml = '' + 
	'<div id="jsmc-collapse"></div>' +
	'<div id="jsmc-clear">&#xd7</div>' +
	'<div id="jsmc-content">' +
	'	<input id="jsmc-button" type="button" value="Run"/>' +
	'	<div id="jsmc-log">' +
	'	</div>' +
	'	<div id="jsmc-input-container">' +
	'		<input id="jsmc-input" type="text" placeholder="type your js here"/>' +
	'	</div>' +
	'</div>' +
	'';

	var logElementHtml = '' +
	'	<div class="jsmc-log-text"></div>' +
	'	<div class="jsmc-log-target"></div>' +
	'';

	var mobileConsole = {
		props: {
			showOnError: false,
			proxyConsole: true,
			isCollapsed: false,
			catchErrors: true
		},

		init: function(){
			if (!this.initialized){
				if (this.props.catchErrors){
					this.bindErrorListener();
				}
				this.initializeContainers();
				this.bindListeners();
				this.initialized = true;

				if (this.props.proxyConsole){
					this.decorateConsole();
				} else {
					this.undecorateConsole();
				}
			}
		},

		options: function(options){
			for (var i in options){
				if (typeof this.props[i] !== 'undefined'){
					this.props[i] = options[i];
				}
			}
			this.init();
		},

		show: function(options){
			var el = document.getElementById('js-mobile-console');
			if (!el){
				this.init();
			}
			this.$el.container.style.display = 'block';

			if (options && options.expand){
				this.toggleCollapsed(false);
			}
		},

		hide: function(){
			if (this.$el && this.$el.container){
				this.$el.container.style.display = 'none';
			}
		},

		destroy: function(){
			var el = document.getElementById('js-mobile-console');
			el.parentNode.removeChild(el);
		},

		initializeContainers: function(options){
			this.$el = {};
			el = this.$el.container = document.createElement('div');
			el.id = 'js-mobile-console';
			el.innerHTML = containerHtml;
			el.style.display = 'none';
			document.body.appendChild(el);

			this.$el.input = document.getElementById('jsmc-input');
			this.$el.button = document.getElementById('jsmc-button');
			this.$el.log = document.getElementById('jsmc-log');
			this.$el.content = document.getElementById('jsmc-content');
			this.$el.collapseControl = document.getElementById('jsmc-collapse');
			this.$el.clearControl = document.getElementById('jsmc-clear');

			if (this.props.isCollapsed){
				this.$el.content.style.display = 'none';
				this.$el.clearControl.style.display = 'none';
				this.isCollapsed = true;
				this.$el.collapseControl.innerHTML = '&#9650;';
			} else {
				this.$el.collapseControl.innerHTML = '&#9660;';				
			}
		},

		toggleCollapsed: function(toBeCollapsed){
			this.isCollapsed = typeof toBeCollapsed === 'boolean' ? toBeCollapsed : !this.isCollapsed;
			var display = this.isCollapsed ? 'none' : 'block';
			this.$el.content.style.display = display;
			this.$el.collapseControl.innerHTML = this.isCollapsed ? '&#9650;' : '&#9660;';
			if (this.isCollapsed){
				this.$el.clearControl.style.display = 'none';
			} else {
				this.$el.clearControl.style.display = 'block';
			}
		},

		bindListeners: function(){
			var self = this;
			this.$el.collapseControl.addEventListener('click', function(){
				self.toggleCollapsed();
			});

			this.$el.clearControl.addEventListener('click', function(){
				self.clearLogs();
			});

			this.$el.button.addEventListener('click', function(){
				logValue();
			});

			this.$el.input.addEventListener('keyup', function(e){
				if (e.which === 13){
					logValue();
				}
			});

			function logValue(){
				var val = self.$el.input.value;
				var text;
				var error;
				try {
					text = window.eval(val);
				} catch (e){
					text = e;
					error = true;
				}
				self.logValue(text, error);
			}
		},

		clearLogs: function(){
			this.$el.log.innerHTML = '';
		},

		bindErrorListener: function(){
			var self = this;
			window.onerror = function(errorMessage, file, lineNumber, columnNumber){
				if (self.props.showOnError){
					self.show({expand: true});
				}
				var error = file + ':' + lineNumber + (columnNumber ? (':' + columnNumber) : '');
				self.logValue(errorMessage, error);
			};
		},

		appendLogEl: function(el){
			this.$el.log.appendChild(el);
			this.$el.log.scrollTop = this.$el.log.scrollHeight;
		},

		decorateConsole: function(){
			var self = this;
			if (this.consoleDecorated){
				return;
			}
			this.consoleDecorated = true;
			if (window.console){
				if (window.console.log){
					this.oldLog = window.console.log;
					window.console.log = function(){
						var args = [].slice.call(arguments);
						self.oldLog.apply(window.console, args);
						self.logValue(args.join(' '));
					};
				}
			}
		}, 

		undecorateConsole: function(){
			var self = this;
			if (this.consoleDecorated){
				window.console.log = function(){
					var args = [].slice.call(arguments);
					self.oldLog.apply(window.console, args);
				};
			}
		},

		logValue: function(value, error){			
			var logEl = document.createElement('div');
			logEl.className = 'jsmc-log-el';
			logEl.innerHTML = logElementHtml;

			if (error){
				logEl.className += ' jsmc-log-error';
			}

			var logTextEl = logEl.getElementsByClassName('jsmc-log-text')[0];
			logTextEl.innerHTML = value;

			if (typeof error === 'string'){
				var logTargetEl = logEl.getElementsByClassName('jsmc-log-target')[0];
				logTargetEl.innerHTML = error;
			}

			this.appendLogEl(logEl);
		}
	};

	mobileConsole.decorateConsole();

	return mobileConsole;

});