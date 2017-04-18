// JavaScript Document
/*global $*/
$(function(){
	
	//initialize variables
	var currentIndex = -1;

	//set default attributes
	$('.zipcode').attr('maxLength', 5).addClass('numeric');
	$('.textarea').attr({'value': '', 'contentEditable': "true"});
	
	//check text area, option, switch
	checkTextArea($('.textarea'));
	checkOption($('.option'));
	checkSwitch($('.switch'));
	checkDropDown($('.dropdown'));
	checkSlider($('.slider'));
	
	//check each input
	$('.textbox').each(function(){
		if(!$(this).attr('value')){$(this).attr('value', "");}
		if($(this).hasClass('range')){checkRange($(this));}
		if($(this).hasClass('required')){checkRequiredText($(this));}
		if($(this).hasClass('phone')){checkRequiredPhone($(this));}
		if($(this).hasClass('email')){checkRequiredEmail($(this));}
		if($(this).hasClass('zipcode')){checkRequiredZipCode($(this));}
	});
		
	//input key up listeners
	$('.textbox').keyup(function(){
        $(this).attr('value', $(this).val());
		if($(this).hasClass('range')){checkRange($(this));}
		if($(this).hasClass('required')){checkRequiredText($(this));}
		if($(this).hasClass('phone')){checkRequiredPhone($(this));}
		if($(this).hasClass('email')){checkRequiredEmail($(this));}
		if($(this).hasClass('zipcode')){checkRequiredZipCode($(this));}
    });
	
	//check range
	function checkRange(obj){
		var value = parseInt(obj.val());
		var slider = obj.parent().parent('.slider-group').find('.slider');
		var min, max = 0;
		if(slider.length){
			min = getMin(slider);
			max = getMax(slider);
			if(value >= min && value <= max){
				if(!isNaN(value)){
					setSlider(slider, value);
					obj.siblings('.hint').text(min + "-" + max);
				}
			}
			else{
				obj.val("").attr('value', "");
			}
		}
		else{
			min = getMin(obj);
			max = getMax(obj);
			if(value >= min && value <= max){
				obj.val(value).attr('value', value);
			}
			else{
				obj.val("").attr('value', "");
			}
		}
	}
	
	//check text
	function checkRequiredText(obj){
		var len = obj.val().length;
		checkCounter(obj, len);
	}
	
	//check phone
	function checkRequiredPhone(obj){
		if(validatePhone(obj.val())){obj.addClass('valid');}
		else {obj.removeClass('valid');}
	}
	
	//check email
	function checkRequiredEmail(obj){
		if(validateEmail(obj.val())){obj.addClass('valid');}
		else {obj.removeClass('valid');}
	}
	
	//check zip code
	function checkRequiredZipCode(obj){
		if(validateZipCode(obj.val())){obj.addClass('valid');}
		else {obj.removeClass('valid');}
	}
	
	//numeric key press listener
	$('.numeric').keypress(function(e){
		return isNumber(e);
	});
	
	//textarea key up listener
	$('.textarea').keyup(function(){
		checkTextArea($(this));
	});
	
	//check text area
	function checkTextArea(obj){
		obj.attr('value', obj.text());
		var len = obj.text().length;
		checkCounter(obj, len);
	}
	
	//option click listener
	$('.option').click(function(){
		$(this).toggleClass('checked');
		checkOption($(this));
	});
	
	//check option
	function checkOption(obj){
		var list = [];
		var group = obj.parent('.option-group');
		group.each(function(){
			$(this).find('.option').each(function(i){
				var obj = $(this);
				if(obj.hasClass('checked')){
					list.push(obj.find('.label').text());	
				}
				else{
					list.splice(i, 1);
				}		
			});
			$(this).attr('value', list);	
		});
	}
	
	//switch click listener
	$('.switch').click(function(){
		$(this).toggleClass('checked');
		checkSwitch($(this));
	});
	
	//check switch
	function checkSwitch(obj){
		obj.attr('value', obj.hasClass('checked') ? obj.find('.label:last-child').text() : obj.find('.label:first-child').text());
	}
	
	//dropdown list item click listener
	$(document).delegate('.dropdown ul li', 'click', function(){
		var obj = $(this);
		$('.dropdown ul li').removeClass('active');
		obj.addClass('active');
		obj.parent().siblings('.select').val(obj.text()).attr('value', obj.text());
	});
	
	//dropdown select and arrow mouse down listener
	$('.select, .arrow').mousedown(function(){
		$(this).parent().toggleClass('open');
	});
	
	//dropdown select focus in listener
	$('.select').focusin(function(){
		var value = $(this).val();
		$(this).parent().find('ul').animate({'opacity':1}, 100, function(){
			$(this).parent().addClass('open');
		});
		matchItem(value);
	});
	
	//dropdown select focus out listener
	$('.select').focusout(function(){
		var obj = $(this).parent().find('ul');
		obj.animate({'opacity':0}, 100, function(){
			$(this).parent().removeClass('open');
		});
		if(!obj.parent().find('li').hasClass('active')){
			obj.parent().find('li').removeClass('active');
			obj.val("").attr('value', "");
		}
		currentIndex = -1;
	});

	//dropdown select key up listener
	$('.select').keyup(function(e){
		var value = $(this).val();
		var charCode = e.keyCode;
		//check if input matches list and key is not up, down, or enter
		if(charCode !== 40 && charCode !== 38 && charCode !== 13){
			matchItem(value);
			$(this).parent().addClass('open');	
		}
		//close dropdown list with backspace when input field is empty
		if(charCode === 8 && $(this).val().length === 0){
			$(this).parent().removeClass('open');
			$(this).parent().find('li').removeClass('active');
		}
	});
	
	//dropdown select key down listener
	$('.select').keydown(function(e){
		var charCode = e.keyCode;
		if($(this).parent().hasClass('open')){
			//scroll down list
			if(charCode === 40){
				currentIndex ++;
				if(currentIndex > $(this).parent().find('ul li').length - 1){
					currentIndex = 0;	
				}
				setItem($(this));
			}
			//scroll up list
			if(charCode === 38){
				currentIndex --;
				if(currentIndex < 0){
					currentIndex = $(this).parent().find('ul li').length - 1;
				}
				setItem($(this));
			}
			//set input field to active item on enter or tab
			if((charCode === 13 || charCode === 9) && $(this).parent().find('li').hasClass('active')){
				var obj = $(this).parent().find('li[class*="active"]');
				$(this).val(obj.text()).attr('value', obj.text());
				$(this).parent().removeClass('open');
			}
			//set input field to empty on enter or tab if there is no active item
			if((charCode === 13 || charCode === 9) && !$(this).parent().find('li').hasClass('active')){
				$(this).val("").attr('value', "");
			}
		}
		//open dropdown list on down
		if(charCode === 40){
			$(this).parent().addClass('open');	
		}
	});
	
	//select drop down item
	function matchItem(value){
		$('.dropdown li').each(function(i){
			if($(this).text().toLowerCase().indexOf(value.toLowerCase()) === 0 && value.length > 0){
				$(this).addClass('active');
				$(this).parent().scrollTo($(this),0);
				currentIndex = i;
			}
			else{$(this).removeClass('active');}
		});
	}
	
	//set active drop down item
	function setItem(obj){
		obj = obj.parent().find('li');
		obj.not(currentIndex).removeClass('active');
	   	obj.eq(currentIndex).addClass('active');
		obj.parent().find('ul').scrollTo(obj.eq(currentIndex),0);
	}
	
	//load drop down data from text file
	function loadDropDown(obj, file){
		$.ajax({
			url: file,
    		type: 'get',
			success: function(data){
        		var lines = data.split("\n");
        		for (var i = 0; i < lines.length; i++) {
            		obj.find('ul').append('<li>'+lines[i]+'</li>');
        		}
				sortDropDown(obj);
				obj.attr('status', 'success');
			}, 
			error: function(){
				obj.attr('status', 'error');
			}
		});
    }
	
	//check drop down
	function checkDropDown(obj){
		obj.each(function(){
			if($(this).attr('source')){loadDropDown($(this), $(this).attr('source'));}
			else{sortDropDown(obj);}
			if($(this).attr('height')){$(this).find('ul').css({'height': $(this).attr('height'), 'overflow': 'scroll'});}
		});
	}
	
	//sort drop down
	function sortDropDown(obj){
		if(obj.attr('sort') === "asc"){sortListAZ(obj);}
		if(obj.attr('sort') === "desc"){sortListZA(obj);}
	}
	
	//sort list az
	function sortListAZ(obj){
		obj.find('li').sort(function(a, b){
			if( $(a).text() > $(b).text()){return 1;}
			if( $(a).text() < $(b).text()){return -1;}
			return 0;
		}).appendTo(obj.find('ul'));
	}
	
	//sort list za
	function sortListZA(obj){
		obj.find('li').sort(function(a, b) {
			if( $(a).text() < $(b).text()){return 1;}
			if( $(a).text() > $(b).text()){return -1;}
			return 0;
		}).appendTo(obj.find('ul'));
	}
	
	//control range slider
	$('.slider-icon').mouseover(function(){
		$(this).addClass('active');
	});
	
	$('.slider-icon').mouseout(function(){
		if(!$(this).parent().parent('.slider').prop('drag')){
			$(this).removeClass('active');
		}
	});
	
	$('.slider').click(function(){
		$(this).find('.slider-icon').addClass('active');
	});
	
	$('.slider').mousedown(function(e){
		$(this).addClass('active');
		var px = $(this).offset();
   		var ox = e.pageX - px.left;
		$(this).trigger('click');
		$(this).prop('drag', true);
		moveSlider($(this), ox);
	});
	
	$(document).mouseup(function(e){
		var slider = $('.slider[class*="active"]');
		slider.removeClass('active');
		slider.prop('drag', false);
		if(!$(e.target).hasClass('slider-icon')){
			slider.find('.slider-icon').removeClass('active');
		}
	});
	
	$(document).mousemove(function(e){
		var slider = $('.slider[class*="active"]');
		if(slider.length){
			var px = slider.offset();
			var ox = e.pageX - px.left;
			if(slider.prop('drag')){
				if(ox > 0 && ox <= slider.width()){
					moveSlider(slider, ox);
				}
			}
		}
	});
	
	//check range slider
	function checkSlider(obj){
		var p = 0;
		obj.each(function(){
			var obj = $(this);
			obj.prop('drag', false);
			if(obj.attr('value')){
				p = obj.attr('value');
				obj.find('.slider-icon').text(p);
				setSlider(obj, p);
			}
			if(obj.find('.min').length){
				var min = getMin(obj);
				obj.find('.min').text(min);	
			}
			if(obj.find('.max').length){
				var max = getMax(obj);	
				obj.find('.max').text(max);
			}
		});
	}
	
	//move range slider
	function moveSlider(obj, ox){
		var x = obj.find('.slider-icon');
		x.css({'left': ox - (x.width() / 2)});
		var p = ox / obj.width() * getMax(obj);
		p = Math.round(p);
		x.text(p);
		var range = obj.parent().parent('.slider-group').find('.range');
		range.val(p).attr('value', p);
	}
	
	//set slider
	function setSlider(obj, p){
		var ox = (p * obj.width()) / getMax(obj);
		moveSlider(obj, ox);
	}
	
	//get slider min
	function getMin(obj){
		var value = 	obj.attr('min') ? obj.attr('min') : 0;
		return parseInt(value);
	}
	
	//get slider max
	function getMax(obj){
		var value = 	obj.attr('max') ? obj.attr('max') : 100;
		return parseInt(value);
	}
	
	//check counter
	function checkCounter(obj, len){
		if(!obj.siblings('.counter').length){
			if(len > 0){obj.addClass('valid');}
			else {obj.removeClass('valid');}
			return;
		}
		var minLen = obj.attr('minLen') ? obj.attr('minLen') : 0;
		var maxLen = obj.attr('maxLen') ? obj.attr('maxLen') : 15;
		obj.siblings('.counter').text(len + " / " + maxLen);
		
		if(len > minLen && len <= parseInt(maxLen)){obj.addClass('valid');}
		else{obj.removeClass('valid');}
	}
	
	//validate phone
	function validatePhone(value){
		var expr = /^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/;
		return value.match(expr);
	}
	
	//validate email
	function validateEmail(value){
		var expr = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
		return value.match(expr);	
	}
	
	//validate zip code
	function validateZipCode(value){
		var expr =  /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		return value.match(expr);
	}
	
	//validate number
	function isNumber(e) {
    	e = (e) ? e : window.event;
    	var charCode = (e.which) ? e.which : e.keyCode;
    	if (charCode > 31 && (charCode < 48 || charCode > 57)){return false;}
    	return true;
	}
	
	/*--------------
	BUTTON LISTENERS
	--------------*/
	
	//submit click listener
	$('#submit').click(function(){
		var message;
		if(!$('.textbox, .textarea').hasClass('valid')){
			if(!$('.submit-message').attr('error')){message = "Error";}
			else{message = $('.submit-message').attr('error');}
			$('.submit-message').text(message).removeClass('valid');
		}
		else{
			if(!$('.submit-message').attr('success')){message = "Success";}
			else{message = $('.submit-message').attr('success');}
			$('.submit-message').text(message).addClass('valid');
		}
	});
	
	//reset click listener
	$('#reset').click(function(){
		$('.textbox').val("").attr('value', "");
		$('.textarea').text("").attr('value', "");
		$('.option').removeClass('checked').parent().attr('value', "");
		$('.submit-message').text("");
		checkRequiredText($('.required'));
		checkTextArea($('.textarea'));
	});
	
	$(window).resize(function(){
		checkSlider($('.slider'));
	});
});