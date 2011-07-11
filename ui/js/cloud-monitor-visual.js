function renderPluginChart(plugin, chartParams) {
	switch(plugin){	
	
		case 'free':
		
			freePluginChart(chartParams);
			
			break;
			
		case 'df':
			
			dfPluginChart(chartParams);
		
			break;
			
		case 'lsof':
			
			lsofPluginChart(chartParams);
		
			break;
			
		case 'daemons':
			
			daemonsPluginChart(chartParams);
		
			break;
			
	}
}

function renderPluginCount(count) {
	$(PLUGIN_ENTRY_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + count + '</strong><p>Entries</p></li>');				
}

function dynamicPluginLineChart(dataSet, max, date, yTitle, tooltip) {	
	var chart = new Highcharts.Chart({
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },

	    title: {
			text: 'Plugin Chart - ' + ip + ' - ' + date,
			x: -20
		},
		
		subtitle: {
			text: 'Plugin: ' + plugin,
			x: -20
		},
		
		yAxis: {
			minPadding: 0.2,
            maxPadding: 0.2,
			min: 0,
			max: max * 1.2,
			title: {
				text: yTitle
			}
		},

		tooltip: {
			formatter: function() {
	          	return '<b>'+ this.series.name +'</b><br/>'+
				this.x +': '+ this.y + ' ' + tooltip;
			}
		},
		
		series: [{
			data: [],
	    	name: plugin
	    }]
	});
	
	dataSet.forEach(
		function (point) {
		 	chart.series[0].addPoint(point);
		}
	);
}

function dynamicPluginDateChart(dateSet, max, date, yTitle, tooltip) {	
	var chart = new Highcharts.Chart({
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },

	    title: {
			text: 'Plugin Chart - ' + ip + ' - ' + date,
			x: -20
		},
		
		subtitle: {
			text: 'Plugin: ' + plugin,
			x: -20
		},
		
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150,
			maxZoom: 20 * 1000
		},
		
		yAxis: {
			minPadding: 0.2,
            maxPadding: 0.2,
			min: 0,
			max: max * 1.2,
			title: {
				text: yTitle
			}
		},

		tooltip: {
			formatter: function() {
	          	return '<b>'+ this.series.name +'</b><br/>'+
				this.x +': '+ this.y + ' ' + tooltip;
			}
		},
		
		series: [{
			data: [],
	    	name: plugin
	    }]
	});
	
	dateSet.forEach(
		function (point) {	
			console.log('points: ' + point[0] + ' ' + point[1]);
		 	chart.series[0].addPoint(point[0], point[1]);
		}
	);
}

function staticPluginDateChart(dateSet, max, tooltip) {	
	var chart = new Highcharts.Chart({
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },

		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150,
			maxZoom: 20 * 1000
		},
		
		title: {
			text: ''
		},
		
		yAxis: {
			minPadding: 0.2,
            maxPadding: 0.2,
			min: 0,
			max: max * 1.2
		},

		tooltip: {
			formatter: function() {
	          	return '<b>'+ this.series.name +'</b><br/>'+
				this.x +': '+ this.y + ' ' + tooltip;
			}
		},
		
		series: [{
			data: dateSet,
	    	name: plugin
	    }]
	});
}

function uptimeChart(dateSet1, dateSet2, max1, max2, tooltip) {	
	var chart2 = new Highcharts.Chart({
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },

		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150,
			maxZoom: 20 * 1000
		},
		
		title: {
			text: ''
		},
		
		yAxis: {
			minPadding: 0.2,
            maxPadding: 0.2,
			min: 0,
			max: max2 * 1.2
		},

		tooltip: {
			formatter: function() {
	          	return '<b>'+ this.series.name +'</b><br/>'+
				this.x +': '+ this.y + ' ' + tooltip;
			}
		},
		
		 series: [{
	    	name: 'test1',
	        data: dateSet2
	    }]
	});
}

function iostatChart(dateSet1, dateSet2, max1, max2) {
   var chart = new Highcharts.Chart({
      chart: {
         renderTo: 'plugin-charts-container',
         zoomType: 'xy'
      },
      title: {
         text: ''
      },
      
      xAxis: {
		type: 'datetime',
		tickPixelInterval: 150,
		maxZoom: 20 * 1000
	  },
      yAxis: [{ // Primary yAxis
         labels: {
            formatter: function() {
               return this.value +' %';
            },
            style: {
               color: '#89A54E'
            }
         },
         title: {
            text: 'Temperature',
            style: {
               color: '#89A54E'
            }
         }
      }, { // Secondary yAxis
         title: {
            text: 'Rainfall',
            style: {
               color: '#4572A7'
            }
         },
         labels: {
            formatter: function() {
               return this.value +' mm';
            },
            style: {
               color: '#4572A7'
            }
         },
         opposite: true
      }],
      legend: {
         layout: 'vertical',
         align: 'left',
         x: 120,
         verticalAlign: 'top',
         y: 100,
         floating: true,
         backgroundColor: '#FFFFFF'
      },
      series: [{
         name: 'disk mbs',
         color: '#4572A7',
         type: 'column',
         yAxis: 1,
         data: dateSet1      
      
      }, {
         name: 'cpu usage',
         color: '#89A54E',
         type: 'spline',
         data: dateSet2
      }]
   });
}

function staticPluginLineChart(dataSet, max) {
	var chart = new Highcharts.Chart({
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },

	    title: {
			text: 'Plugin Chart - ' + ip + ' - ' + date,
			x: -20
		},
		
		subtitle: {
			text: 'Plugin: ' + plugin,
			x: -20
		},
		
		yAxis: {
			min: 0,
			max: max * 1.2,
			title: {
				text: 'Some description'
			}
		},

		tooltip: {
			formatter: function() {
	                return '<b>'+ this.series.name +'</b><br/>'+
					this.x +': '+ this.y +' some description';
			}
		},
	    
	    series: [{
	    	name: plugin,
	        data: dataSet
	    }]
	});
}

function freePluginChart(chartParams) {
	var chart;
	chart = new Highcharts.Chart({
	  credits: {
	  	 enabled: false
	  },
	  chart: {
	     renderTo: 'plugin-charts-container',
	     zoomType: 'x',
	     spacingRight: 20
	  },
	  title: {
	     text: 'Plugin: free'
	  },
	  subtitle: {
	     text: 'Free Memory: free -t -m | awk \'NR==5{print $4}\''
	  },
	  xAxis: {
	     type: 'datetime',
	     maxZoom: 1 * 24 * 3600000,
	     title: {
	        text: null
	     }
	  },
	  yAxis: {
	     title: {
	        text: 'Free Memory (MB)'
	     },
	     min: 0,
	     max: chartParams[1] * 1.2,
	     startOnTick: false,
	     showFirstLabel: false
	  },
	  tooltip: {
	     shared: true               
	  },
	  legend: {
	     enabled: false
	  },
	  plotOptions: {
	     area: {
	        fillColor: {
	        	linearGradient: [0, 0, 0, 300],
	           	stops: [
	              [0, 'rgb(243, 191, 189)'],
	              [1, 'rgba(2,0,0,0)']
	           ]
	        },
	        lineWidth: 1,
	        marker: {
	           enabled: false,
	           states: {
	              hover: {
	                 enabled: true,
	                 radius: 5
	              }
	           }
	        },
	        shadow: false,
	        states: {
	           hover: {
	              lineWidth: 1                  
	           }
	        }
	     }
	  },
	  series: [{
	     color: '#aa4643',
	     type: 'area',
	     name: ip + ' Free Memory (MB)',
	     pointInterval: 1 * 30 * 1000,
	     pointStart: pluginChartDate,
	     data: chartParams[0]
	  }]
	});
}

function dfPluginChart(chartParams) {
	var chart;
	chart = new Highcharts.Chart({
		credits: {
	  	    enabled: false
	    },
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150,
			maxZoom: 20 * 1000
		},
		title: {
	     	text: 'Plugin: df'
	  	},
	  	subtitle: {
	        text: 'Boot Disk Space: df -h | grep \'/dev/sda1\' | awk \'{print $5}\''
	  	},
		yAxis: {
			title: {
	        	text: 'Disk Space Used (Percent)'
	     	},
			minPadding: 0.2,
            maxPadding: 0.2,
			min: 0,
			max: chartParams[1] * 1.2
		},
		tooltip: {
			formatter: function() {
	          	return '<b>'+ this.series.name +'</b><br/>'+
				this.x +': '+ this.y + ' Percent';
			}
		},
		series: [{
			data: chartParams[0],
	    	name: ip + ' Disk Space Used (Percent)'
	    }]
	});
}

function lsofPluginChart(chartParams) {
	var chart;
	chart = new Highcharts.Chart({
		credits: {
	  	    enabled: false
	    },
	    chart: {
	        renderTo: 'plugin-charts-container',
			defaultSeriesType: 'line'
	    },
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150,
			maxZoom: 20 * 1000
		},
		title: {
	     	text: 'Plugin: lsof'
	  	},
	  	subtitle: {
	        text: 'Open Files: lsof | wc -l'
	  	},
		yAxis: {
			title: {
	        	text: 'Open Files'
	     	},
			minPadding: 0.2,
            maxPadding: 0.2,
			min: 0,
			max: chartParams[1] * 1.2
		},
		tooltip: {
			formatter: function() {
	          	return '<b>'+ this.series.name +'</b><br/>'+
				this.x +': '+ this.y + '';
			}
		},
		series: [{
			data: chartParams[0],
	    	name: ip + ' Open Files'
	    }]
	});
}

function daemonsPluginChart(chartParams) {

}