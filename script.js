/*

Shooting Gallery

a FUN javascript game
v 0.0.1
http://www.webcunningham.com

*/


var sG = {
	general : {
		random : function (min,max) { // returns a random int between min and max
		    return Math.random() * (max - min) + min;
		},
		randomOption : function (options) { // returns a random option from array of options
			var random = Math.floor(sG.general.random(0,options.length)),
				i=0,
				ret;

				do {
					ret = options[i];
					i++;
				} 
				while (i < random + 1);

				return ret;
		}
	},
	gun : {
		coords : { // coords of crosshair, not mouse
			x : 0,
			y : 0
		},
		intervalIds : {},
		setCoords : function (x,y) {
			sG.gun.coords.x = x;
			sG.gun.coords.y = y;
		},
		getCoords : function () {
			return [sG.gun.coords.x, sG.gun.coords.y];
		},
		fire : function() { // the fire event which occurs on mousedown
			$('.target').each(function() {
				var target = $(this),
					this_area = {
					x : target.offset().left,
					y : target.offset().top,
					width : target.width(),
					height : target.height()
					},
					this_id = target.attr('id'),
					gunPosition = sG.gun.getCoords(),
					accuracyX = 0, 
					accuracyY = 0,
					accuracy, centerX, centerY;

				if ((gunPosition[0] >= this_area.x) && 
					(gunPosition[0] <= this_area.x + this_area.width) && 
					(gunPosition[1] >= this_area.y) && 
					(gunPosition[1] <= this_area.y + this_area.height)) // if the crosshair is in the target
				{
					centerX = this_area.x + (this_area.width / 2); // calculate the center point
					centerY = this_area.y + (this_area.height / 2);
				}
				
				accuracyX = Math.abs(100 - Math.abs(gunPosition[0] - centerX));
				accuracyY = Math.abs(100 - Math.abs(gunPosition[1] - centerY));
				accuracy = Math.round((accuracyX + accuracyY) / 2);

				if (accuracy > 0) {
					sG.target.destroy('#'+this_id, accuracy);

					sG.score.set.points(sG.score.points + accuracy);
					sG.score.set.hits(sG.score.hits + 1);
				} 
			});
			
			sG.score.set.shots(sG.score.shots + 1);
			sG.score.update();
		},
		makeCrossHair : function() {
			$('.crosshair').show();
		    function handleMouseMove(event) {
		        var eventDoc, doc, body,
		        	crosshair = $('.crosshair'),
		        	$window = $(window);

		        event = event || window.event; // IE-ism

		        // If pageX/Y aren't available and clientX/Y are,
		        // calculate pageX/Y - logic taken from jQuery.
		        // (This is to support old IE)
		        if (event.pageX === null && event.clientX !== null) {
		            eventDoc = (event.target && event.target.ownerDocument) || document;
		            doc = eventDoc.documentElement;
		            body = eventDoc.body;

		            event.pageX = event.clientX +
		              ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
		              ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
		            event.pageY = event.clientY +
		              ((doc && doc.scrollTop)  || (body && body.scrollTop)  || 0) -
		              ((doc && doc.clientTop)  || (body && body.clientTop) || 0);
		        }
        
		        sG.gun.setCoords(-event.pageX + $window.width(),  -event.pageY + $window.height());
		      
		        crosshair.css('top', -event.pageY + $window.height());
		        crosshair.css('left', -event.pageX + $window.width());
		    }
		    document.onmousemove = handleMouseMove;
		}
	},
	target : {
		count : 0,
		defaults : {
			sizeOptions : ["small","medium","large"],
			positionOptions : ["top","middle","bottom"], 
			move : true,
			durationMin : 3000, 
			durationMax : 12000 
		},
		generate : function(options) {
			var randomSize = sG.general.randomOption(sG.target.defaults.sizeOptions),
				randomPosition = sG.general.randomOption(sG.target.defaults.positionOptions),
				id = sG.target.count,
				container = document.getElementsByTagName("div")[0],
				docfrag = document.createDocumentFragment(),
				target = document.createElement("div"),
				bullseye = document.createElement("span"),
				randomDuration;

			if (typeof options == "undefined") {
				options = sG.target.defaults;
			} 

			options.size = options.size === "random" ? randomSize : options.size;
			options.position = options.position === "random" ? randomPosition : options.position;
			randomDuration = sG.general.random(options.durationMin, options.durationMax);
			
			$(target).addClass("target "+randomSize+" "+randomPosition+" target"+id);
			target.setAttribute("id", "target"+id);
			
			// add the elements to the DOM
			target.appendChild(bullseye);
			docfrag.appendChild(target);
			container.appendChild(docfrag);	

			if (options.move) {
				sG.target.move("#target"+id, randomDuration);
			}

			sG.target.count++;
		},
		move : function(selector, duration) {
			var _this = $(selector);
			function complete() {
				sG.target.miss(selector);
			}
			_this.velocity(
				{
					left: "-200px"
				},
				{
					duration: duration,
					easing: sG.settings.easing,
					complete: complete
				}
			);
		},
		autoGenerate : function () {
			window.autoGenerate = setInterval(sG.target.generate,sG.settings.generateDelay);
		},
		stopGenerating : function () {
			clearInterval(window.autoGenerate);
		},
		miss : function (selector) {
			var missesAllowed = sG.settings.missesAllowed;
			
			sG.score.set.misses(sG.score.misses + 1);
			sG.score.update();

			if (sG.score.misses >= sG.settings.missesAllowed) {
				sG.stop();
			}
		},
		destroy : function (selector, score) {
			var _this = $(selector);

			function complete() {
				_this.remove();
			}

			function completeDelay(time) {
				var delay = setTimeout(complete,time);
			}

			function appendScore(selector) {
				var this_score = document.createElement('p'),
					$this_score = $(this_score),
					this_id = $(selector).attr('id'),
					this_target = document.getElementById(this_id);
				$this_score.addClass('score');
				$this_score.text(score);

				this_target.appendChild(this_score);
				$this_score.velocity({top: "-=300px", opacity: 0},2000);
				completeDelay(800);
			}

			_this.velocity("stop");
			appendScore(selector);
			
			_this.velocity(
				{
					opacity: 0
				},{
					duration : 800,
					complete : appendScore
				}
			);	
		}
	},
	score : {
		shots : 0,
		hits : 0,
		points : 0,
		misses : 0,
		getAccuracy : function() {
			var average = Math.floor((sG.score.hits / sG.score.shots) *100);
			if (sG.score.shots === 0 || typeof average === "NaN") {
				average = 0;
			} 
			return average > 100 ? 100 : average;
			
		},
		set : {
			shots : function(shots) {
				sG.score.shots = shots;
			},
			hits : function(hits) {
				sG.score.hits = hits;
			},
			points : function(points) {
				sG.score.points = points;
			},
			misses : function(misses) {
				sG.score.misses = misses;
			}
		},
		update : function () {
			$('tr.points .count').text(sG.score.points);
			$('tr.hits .count').text(sG.score.hits);
			$('tr.shots .count').text(sG.score.shots);
			$('tr.accuracy .count').text(sG.score.getAccuracy()+"%");
			$('tr.misses .count').text(sG.score.misses);
		}
	},
	start : function () {
		$('.intro').fadeOut('1000');
		sG.gun.makeCrossHair();
		sG.target.autoGenerate();

		$(document).on('mousedown', sG.gun.fire);
	},
	restart : function () {
		$('.outro').fadeOut('1000');
		sG.score.set.shots(0);
		sG.score.set.hits(0);
		sG.score.set.points(0);
		sG.score.set.misses(0);
		sG.score.update();

		sG.target.autoGenerate();
	},
	stop : function () {
		sG.target.stopGenerating();
		$('.target').velocity("stop");
		
		$('.target').each(function(){
			var _this = $(this)
			function removeThis() {
				_this.remove();
			}
			_this.velocity(
				{
					opacity: 0
				},{
					duration : 800,
					complete : removeThis
				}
			);
		});

		$('.outro').show();
	},
	settings : {
		targetCount : 1,
		missesAllowed : 10,
		autoGenerate : true,
		generateDelay : 1000,
		easing : 'linear'
	}
	
};

$(document).ready( function() {
	$
	$('.start').on('click',sG.start);
	$('.restart').on('click',sG.restart);
});