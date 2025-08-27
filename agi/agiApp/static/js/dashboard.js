// Dashboard JavaScript
// Anomaly Detection Data
const anomalyDetectionData = {
  "metadata": {
    "title": "Anomaly Detection Results",
    "threshold": 0.915939627986258,
    "total_samples": 40,
    "normal_count": 38,
    "anomaly_count": 2,
    "timestamp": "20250826_083746"
  },
  "anomaly_scores": {
    "normal_scores": [
      0.4305169262405091, 0.21414979730677705, 0.9129578919316002, 0.2719476323467619,
      0.4271914356256462, 0.23766307171449616, 0.42395132191074003, 0.3041389895420619,
      0.3247309029487627, 0.5676834816282492, 0.9068350946586999, 0.49525681381800274,
      0.5500080453021553, 0.27549435415058693, 0.4491641362778125, 0.19866526689460534,
      0.3120569727475254, 0.37697246471894974, 0.3553499557668026, 0.45324105316188706,
      0.3294105890076615, 0.17770619281458, 0.3362636480148384, 0.32126139713356244,
      0.4857706308087689, 0.2599211980684481, 0.4788734108140696, 0.6565218809767455,
      0.252694494434001, 0.32739917216852976, 0.6323910640198783, 0.30682307735633224,
      0.3427453041924481, 0.5337332525447666, 0.4168503824530334, 0.18444716163933086,
      0.1938844389824849, 0.33378616460859734
    ],
    "anomaly_scores": [0.939913667205212, 0.9248848361502319],
    "threshold": 0.915939627986258
  },
  "yield_analysis": {
    "final_yield": [
      89.5, 92.3, 87.2, 85.1, 91.8, 88.9, 90.4, 93.1, 82.3, 91.2,
      89.7, 86.8, 88.5, 92.6, 84.9, 90.8, 91.4, 94.2, 87.6, 89.3,
      81.7, 92.9, 88.1, 90.1, 91.6, 86.4, 89.8, 85.5, 93.4, 83.2,
      91.0, 90.5, 87.9, 92.1, 88.7, 94.8, 89.1, 91.9, 86.1, 90.7
    ],
    "anomaly_score": [
      0.939913667205212, 0.4305169262405091, 0.9248848361502319, 0.21414979730677705,
      0.9129578919316002, 0.2719476323467619, 0.4271914356256462, 0.23766307171449616,
      0.42395132191074003, 0.3041389895420619, 0.3247309029487627, 0.5676834816282492,
      0.9068350946586999, 0.49525681381800274, 0.5500080453021553, 0.27549435415058693,
      0.4491641362778125, 0.19866526689460534, 0.3120569727475254, 0.37697246471894974,
      0.3553499557668026, 0.45324105316188706, 0.3294105890076615, 0.17770619281458,
      0.3362636480148384, 0.32126139713356244, 0.4857706308087689, 0.2599211980684481,
      0.4788734108140696, 0.6565218809767455, 0.252694494434001, 0.32739917216852976,
      0.6323910640198783, 0.30682307735633224, 0.3427453041924481, 0.5337332525447666,
      0.4168503824530334, 0.18444716163933086, 0.1938844389824849, 0.33378616460859734
    ],
    "predicted_anomaly": [
      1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  "training_history": {
    "epochs": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
    "training_loss": [1.8933109045028687,1.840497612953186,1.8225117921829224,1.699434518814087,1.7124043703079224,1.6284092664718628,1.5559444427490234,1.5307124853134155,1.5016727447509766,1.4928900003433228,1.4121230840682983,1.4051469564437866,1.3178575038909912,1.3024187088012695,1.226706862449646,1.2364928722381592,1.161144495010376,1.1470606327056885,1.1010692119598389,1.0983141660690308,1.026010513305664,0.9748851656913757,0.9878078699111938,0.9530822038650513,0.9118770956993103,0.9090469479560852,0.8093152046203613,0.8197164535522461,0.7992381453514099,0.802012026309967,0.7744792699813843,0.7472628951072693,0.7084335684776306,0.7102473378181458,0.6948534846305847,0.6811724305152893,0.6468279957771301,0.6382805109024048,0.6278195977210999,0.5858964323997498,0.6129230856895447,0.561357319355011,0.5451564192771912,0.6094313859939575,0.5342456102371216,0.547989547252655,0.5403818488121033,0.5145661234855652,0.48975855112075806,0.5302982330322266],
    "validation_loss": [0.834572434425354,0.8294934630393982,0.826552152633667,0.8233189582824707,0.8190373778343201,0.8151042461395264,0.8109554648399353,0.8061604499816895,0.8013879060745239,0.7961314916610718,0.7902030944824219,0.7834270596504211,0.7763805389404297,0.7689172029495239,0.7609702944755554,0.752515435218811,0.7435649633407593,0.7341362833976746,0.7242912650108337,0.7141366600990295,0.7033748626708984,0.6920910477638245,0.680435299873352,0.6681545972824097,0.6557526588439941,0.6430338621139526,0.6300725936889648,0.6168887615203857,0.603378415107727,0.5892967581748962,0.5755645632743835,0.5619588494300842,0.5485262870788574,0.5351499319076538,0.5220400094985962,0.5086549520492554,0.4953973889350891,0.48274242877960205,0.4705086946487427,0.4588853716850281,0.44781386852264404,0.43742096424102783,0.42750975489616394,0.4181044101715088,0.4091288447380066,0.40065211057662964,0.3921552896499634,0.3840818703174591,0.3760972023010254,0.36808261275291443]
  }
};

class AnomalyDashboard {
    constructor(data = anomalyDetectionData) {
        this.data = data;
        this.charts = {};
        this.init();
    }

    init() {
        // Destroy existing charts first
        this.destroyCharts();
        this.updateSummaryCards();
        this.updateTimestamp();
        this.createCharts();
        this.createConfusionMatrix();
        this.populateTable();
        this.bindEvents();
    }

    destroyCharts() {
        // Destroy all chart instances
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey] && typeof this.charts[chartKey].destroy === 'function') {
                this.charts[chartKey].destroy();
            }
        });
        this.charts = {};
    }

    updateSummaryCards() {
        const { metadata } = this.data;
        
        // Update the anomaly count card in the dashboard
        const anomalyCountElement = document.getElementById('anomalyCount');
        if (anomalyCountElement) {
            anomalyCountElement.querySelector('.main-value').textContent = metadata.anomaly_count;
        }
        
        // Update threshold display
        const thresholdElement = document.getElementById('thresholdValue');
        if (thresholdElement) {
            thresholdElement.textContent = metadata.threshold.toFixed(3);
        }
        
        // Update chart summary
        const totalSamplesElement = document.getElementById('totalSamples');
        if (totalSamplesElement) {
            totalSamplesElement.textContent = metadata.total_samples;
        }
        
        const normalCountElement = document.getElementById('normalCount');
        if (normalCountElement) {
            normalCountElement.textContent = metadata.normal_count;
        }
        
        const anomalyCountChartElement = document.getElementById('anomalyCountChart');
        if (anomalyCountChartElement) {
            anomalyCountChartElement.textContent = metadata.anomaly_count;
        }
        
        // Calculate and update detection rate
        const detectionRateElement = document.getElementById('detectionRate');
        if (detectionRateElement) {
            const rate = ((metadata.anomaly_count / metadata.total_samples) * 100).toFixed(1);
            detectionRateElement.textContent = rate + '%';
            
            // Update color based on rate
            detectionRateElement.className = 'yield-metric-value';
            if (parseFloat(rate) > 10) {
                detectionRateElement.classList.add('poor');
            } else if (parseFloat(rate) > 5) {
                detectionRateElement.classList.add('average');
            } else {
                detectionRateElement.classList.add('good');
            }
        }
        
        // Show real-time indicator if anomalies detected recently
        const realTimeStatus = document.getElementById('realTimeAnomalyStatus');
        if (realTimeStatus && metadata.anomaly_count > 0) {
            realTimeStatus.style.display = 'inline-flex';
        } else if (realTimeStatus) {
            realTimeStatus.style.display = 'none';
        }
    }

    updateTimestamp() {
        const timestamp = this.data.metadata.timestamp;
        const formatted = timestamp.replace('_', ' ').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        document.getElementById('lastUpdated').textContent = formatted;
    }

    createCharts() {
        this.createScoresChart();
        this.createYieldChart();
        this.createTrainingChart();
        this.createProductionCharts();
        this.createPredictiveChart();
        this.createSensorCharts();
    }

    createScoresChart() {
        const canvas = document.getElementById('scoresChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { anomaly_scores } = this.data;
        
        // Combine normal and anomaly scores with labels
        const allScores = [];
        const labels = [];
        const colors = [];
        
        // Add normal scores
        anomaly_scores.normal_scores.forEach((score, idx) => {
            allScores.push(score);
            labels.push(`Normal ${idx + 1}`);
            colors.push('rgba(16, 185, 129, 0.6)');
        });
        
        // Add anomaly scores
        anomaly_scores.anomaly_scores.forEach((score, idx) => {
            allScores.push(score);
            labels.push(`Anomaly ${idx + 1}`);
            colors.push('rgba(239, 68, 68, 0.8)');
        });

        this.charts.scoresChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Anomaly Score',
                    data: allScores,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.6', '1').replace('0.8', '1')),
                    borderWidth: 1
                }, {
                    label: 'Threshold',
                    type: 'line',
                    data: new Array(allScores.length).fill(anomaly_scores.threshold),
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.0,
                        title: {
                            display: true,
                            text: 'Anomaly Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Samples'
                        }
                    }
                }
            }
        });
    }

    createYieldChart() {
        const canvas = document.getElementById('yieldChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { yield_analysis } = this.data;
        
        const data = yield_analysis.final_yield.map((yield_val, idx) => ({
            x: yield_val,
            y: yield_analysis.anomaly_score[idx]
        }));
        
        const colors = yield_analysis.predicted_anomaly.map(pred => 
            pred === 1 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.6)'
        );

        this.charts.yieldChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Samples',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.6', '1').replace('0.8', '1')),
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Threshold',
                    type: 'line',
                    data: [
                        { x: Math.min(...yield_analysis.final_yield), y: this.data.anomaly_scores.threshold },
                        { x: Math.max(...yield_analysis.final_yield), y: this.data.anomaly_scores.threshold }
                    ],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    showLine: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Final Yield (%)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Anomaly Score'
                        },
                        min: 0,
                        max: 1
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'point'
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const predicted = yield_analysis.predicted_anomaly[idx];
                                const status = predicted === 1 ? 'Anomaly' : 'Normal';
                                return `Sample ${idx + 1}: Yield ${context.parsed.x}%, Score ${context.parsed.y.toFixed(3)} (${status})`;
                            }
                        }
                    }
                }
            }
        });
    }

    createTrainingChart() {
        const canvas = document.getElementById('trainingChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { training_history } = this.data;

        this.charts.trainingChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: training_history.epochs,
                datasets: [{
                    label: 'Training Loss',
                    data: training_history.training_loss,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Validation Loss',
                    data: training_history.validation_loss,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Training MAE',
                    data: training_history.training_mae,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    hidden: true
                }, {
                    label: 'Validation MAE',
                    data: training_history.validation_mae,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    hidden: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Epoch'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Loss / MAE'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    createProductionCharts() {
        // Output Trend Chart
        const outputElement = document.getElementById('outputTrendChart');
        if (outputElement) {
            this.createMiniChart(outputElement, 'production');
        }

        // Target Chart
        const targetElement = document.getElementById('targetChart');
        if (targetElement) {
            this.createMiniChart(targetElement, 'target');
        }

        // Efficiency Chart
        const efficiencyElement = document.getElementById('efficiencyChart');
        if (efficiencyElement) {
            this.createMiniChart(efficiencyElement, 'efficiency');
        }
    }

    createPredictiveChart() {
        const canvas = document.getElementById('predictionChart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');

        // Generate predictive data
        const hours = [];
        const yieldPrediction = [];
        const failureProbability = [];
        
        for (let i = 0; i < 24; i++) {
            hours.push(`${i}:00`);
            yieldPrediction.push(85 + Math.random() * 15);
            failureProbability.push(Math.random() * 20);
        }

        this.charts.predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Predicted Yield (%)',
                    data: yieldPrediction,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Failure Probability (%)',
                    data: failureProbability,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Yield (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Failure Probability (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time (Hours)'
                        }
                    }
                }
            }
        });
    }

    createSensorCharts() {
        // Temperature Chart
        const tempElement = document.getElementById('tempChart');
        if (tempElement) {
            this.createSensorChart(tempElement, 'temperature');
        }

        // Pressure Chart
        const pressureElement = document.getElementById('pressureChart');
        if (pressureElement) {
            this.createSensorChart(pressureElement, 'pressure');
        }

        // Vibration Chart
        const vibrationElement = document.getElementById('vibrationChart');
        if (vibrationElement) {
            this.createSensorChart(vibrationElement, 'vibration');
        }

        // Energy Chart
        const energyElement = document.getElementById('energyChart');
        if (energyElement) {
            this.createSensorChart(energyElement, 'energy');
        }
    }

    createMiniChart(element, type) {
        // Clear existing content
        element.innerHTML = '';
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        
        const data = this.generateTimeSeriesData(12, type);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    borderColor: this.getChartColor(type),
                    backgroundColor: this.getChartColor(type, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });

        // Store chart instance
        this.charts[type + 'Chart'] = chart;
        return chart;
    }

    createSensorChart(element, sensorType) {
        // Clear existing content
        element.innerHTML = '';
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        
        const data = this.generateSensorData(sensorType);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    borderColor: this.getSensorColor(sensorType),
                    backgroundColor: this.getSensorColor(sensorType, 0.1),
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });

        // Store chart instance
        this.charts[sensorType + 'SensorChart'] = chart;
        return chart;
    }

    generateTimeSeriesData(points, type) {
        const labels = [];
        const values = [];
        const now = new Date();
        
        for (let i = points - 1; i >= 0; i--) {
            const time = new Date(now - i * 3600000); // Hour intervals
            labels.push(time.getHours() + ':00');
            
            switch (type) {
                case 'production':
                    values.push(140 + Math.random() * 20);
                    break;
                case 'target':
                    values.push(85 + Math.random() * 20);
                    break;
                case 'efficiency':
                    values.push(80 + Math.random() * 15);
                    break;
                default:
                    values.push(Math.random() * 100);
            }
        }
        
        return { labels, values };
    }

    generateSensorData(sensorType) {
        const labels = [];
        const values = [];
        
        for (let i = 0; i < 20; i++) {
            labels.push(i);
            
            switch (sensorType) {
                case 'temperature':
                    values.push(22 + Math.random() * 4);
                    break;
                case 'pressure':
                    values.push(4.2 + Math.random() * 1.2);
                    break;
                case 'vibration':
                    values.push(1.5 + Math.random() * 1.5);
                    break;
                case 'energy':
                    values.push(130 + Math.random() * 25);
                    break;
                default:
                    values.push(Math.random() * 100);
            }
        }
        
        return { labels, values };
    }

    getChartColor(type, alpha = 1) {
        const colors = {
            'production': `rgba(16, 185, 129, ${alpha})`,
            'target': `rgba(102, 126, 234, ${alpha})`,
            'efficiency': `rgba(245, 158, 11, ${alpha})`
        };
        return colors[type] || `rgba(156, 163, 175, ${alpha})`;
    }

    getSensorColor(sensorType, alpha = 1) {
        const colors = {
            'temperature': `rgba(239, 68, 68, ${alpha})`,
            'pressure': `rgba(59, 130, 246, ${alpha})`,
            'vibration': `rgba(16, 185, 129, ${alpha})`,
            'energy': `rgba(245, 158, 11, ${alpha})`
        };
        return colors[sensorType] || `rgba(156, 163, 175, ${alpha})`;
    }

    createConfusionMatrix() {
        const { confusion_matrix } = this.data;
        const matrix = confusion_matrix.matrix;
        
        // Calculate metrics
        const tp = matrix[1][1] || 0; // True Positive
        const fp = matrix[0][1] || 0; // False Positive  
        const fn = matrix[1][0] || 0; // False Negative
        const tn = matrix[0][0] || 0; // True Negative
        
        const accuracy = ((tp + tn) / (tp + fp + fn + tn)).toFixed(3);
        const precision = tp + fp > 0 ? (tp / (tp + fp)).toFixed(3) : 'N/A';
        const recall = tp + fn > 0 ? (tp / (tp + fn)).toFixed(3) : 'N/A';
        
        // Update metrics display
        document.getElementById('accuracy').textContent = accuracy;
        document.getElementById('precision').textContent = precision;
        document.getElementById('recall').textContent = recall;
        
        // Create confusion matrix visualization
        const container = document.getElementById('confusionMatrix');
        container.innerHTML = `
            <div class="cm-cell cm-label"></div>
            <div class="cm-cell cm-label">Predicted Normal</div>
            <div class="cm-cell cm-label">Predicted Anomaly</div>
            <div class="cm-cell cm-label">Actual Normal</div>
            <div class="cm-cell cm-value high">${tn}</div>
            <div class="cm-cell cm-value low">${fp}</div>
            <div class="cm-cell cm-label">Actual Anomaly</div>
            <div class="cm-cell cm-value low">${fn}</div>
            <div class="cm-cell cm-value high">${tp}</div>
        `;
    }

    populateTable() {
        const tbody = document.getElementById('samplesTableBody');
        const { yield_analysis, confusion_matrix } = this.data;
        
        tbody.innerHTML = '';
        
        yield_analysis.final_yield.forEach((yield_val, idx) => {
            const score = yield_analysis.anomaly_score[idx];
            const predicted = yield_analysis.predicted_anomaly[idx];
            const actual = confusion_matrix.true_labels[idx];
            
            let status, statusClass;
            if (predicted === 1 && actual === 1) {
                status = 'True Positive';
                statusClass = 'status-anomaly';
            } else if (predicted === 0 && actual === 0) {
                status = 'True Negative';
                statusClass = 'status-normal';
            } else if (predicted === 1 && actual === 0) {
                status = 'False Positive';
                statusClass = 'status-false-positive';
            } else {
                status = 'False Negative';
                statusClass = 'status-false-negative';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${idx + 1}</td>
                <td>${yield_val.toFixed(1)}%</td>
                <td>${score.toFixed(4)}</td>
                <td>${predicted === 1 ? 'Anomaly' : 'Normal'}</td>
                <td>${actual === 1 ? 'Anomaly' : 'Normal'}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    bindEvents() {
        // Filter table
        document.getElementById('filterType').addEventListener('change', (e) => {
            this.filterTable(e.target.value);
        });
        
        // Show/hide validation metrics
        document.getElementById('showValidation').addEventListener('change', (e) => {
            const chart = this.charts.trainingChart;
            chart.data.datasets[1].hidden = !e.target.checked; // Validation Loss
            chart.data.datasets[3].hidden = !e.target.checked; // Validation MAE
            chart.update();
        });
    }

    filterTable(filterType) {
        const tbody = document.getElementById('samplesTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const statusCell = row.cells[5];
            const statusText = statusCell.textContent.toLowerCase();
            
            let show = true;
            if (filterType === 'anomaly') {
                show = statusText.includes('positive') || statusText.includes('negative');
            } else if (filterType === 'normal') {
                show = statusText.includes('true negative') || statusText.includes('false negative');
            }
            
            row.style.display = show ? '' : 'none';
        });
    }

    exportData() {
        const { yield_analysis, confusion_matrix } = this.data;
        let csv = 'Sample,Yield,Anomaly_Score,Predicted,Actual,Status\\n';
        
        yield_analysis.final_yield.forEach((yield_val, idx) => {
            const score = yield_analysis.anomaly_score[idx];
            const predicted = yield_analysis.predicted_anomaly[idx];
            const actual = confusion_matrix.true_labels[idx];
            
            let status;
            if (predicted === 1 && actual === 1) status = 'True Positive';
            else if (predicted === 0 && actual === 0) status = 'True Negative';
            else if (predicted === 1 && actual === 0) status = 'False Positive';
            else status = 'False Negative';
            
            csv += `${idx + 1},${yield_val},${score},${predicted === 1 ? 'Anomaly' : 'Normal'},${actual === 1 ? 'Anomaly' : 'Normal'},${status}\\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anomaly_detection_results_${this.data.metadata.timestamp}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Manufacturing Dashboard Functions
function initializeManufacturingDashboard() {
    // Initialize real-time clock
    updateRealTimeClock();
    setInterval(updateRealTimeClock, 1000);
    
    // Initialize sensor updates
    updateSensorValues();
    setInterval(updateSensorValues, 5000); // Update every 5 seconds
    
    // Initialize equipment monitoring
    updateEquipmentStatus();
    setInterval(updateEquipmentStatus, 10000); // Update every 10 seconds
    
    // Initialize process flow animation
    animateProcessFlow();
}

function updateRealTimeClock() {
    const clockElement = document.getElementById('realTimeClock');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        clockElement.textContent = timeString;
    }
}

function updateSensorValues() {
    // Temperature
    const tempValue = 23.5 + (Math.random() - 0.5) * 2;
    const tempElement = document.getElementById('temperature');
    if (tempElement) {
        tempElement.textContent = tempValue.toFixed(1) + '°C';
    }
    
    // Pressure
    const pressureValue = 4.8 + (Math.random() - 0.5) * 0.4;
    const pressureElement = document.getElementById('pressure');
    if (pressureElement) {
        pressureElement.textContent = pressureValue.toFixed(1) + ' bar';
    }
    
    // Vibration
    const vibrationValue = 2.1 + (Math.random() - 0.5) * 0.8;
    const vibrationElement = document.getElementById('vibration');
    if (vibrationElement) {
        vibrationElement.textContent = vibrationValue.toFixed(1) + ' mm/s';
    }
    
    // Energy
    const energyValue = 142.8 + (Math.random() - 0.5) * 20;
    const energyElement = document.getElementById('energy');
    if (energyElement) {
        energyElement.textContent = energyValue.toFixed(1) + ' kW';
    }
}

function updateEquipmentStatus() {
    const equipmentItems = document.querySelectorAll('.equipment-item');
    equipmentItems.forEach((item, index) => {
        // Randomly update some equipment statuses
        if (Math.random() < 0.1) { // 10% chance to change status
            const statusElement = item.querySelector('.equipment-status');
            const indicatorElement = item.querySelector('.equipment-indicator');
            
            const statuses = ['running', 'warning', 'maintenance'];
            const statusTexts = ['RUNNING', 'WARNING', 'MAINTENANCE'];
            const randomIndex = Math.floor(Math.random() * statuses.length);
            
            if (statusElement && indicatorElement) {
                statusElement.className = `equipment-status ${statuses[randomIndex]}`;
                statusElement.textContent = statusTexts[randomIndex];
                indicatorElement.className = `equipment-indicator ${statuses[randomIndex]}`;
            }
        }
    });
}

function animateProcessFlow() {
    const flowParticles = document.querySelectorAll('.flow-particle');
    flowParticles.forEach(particle => {
        // Add animation class
        particle.style.animation = 'flow-animation 2s linear infinite';
    });
}

function exportData() {
    if (window.dashboard) {
        window.dashboard.exportData();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not already initialized
    if (!window.anomalyDashboard) {
        if (typeof dashboardData !== 'undefined') {
            window.anomalyDashboard = new AnomalyDashboard(dashboardData);
            console.log('Dashboard initialized with external data');
        } else {
            window.anomalyDashboard = new AnomalyDashboard();
            console.log('Dashboard initialized with default data');
        }
    }
});

// Responsive chart resize
window.addEventListener('resize', function() {
    if (window.dashboard && window.dashboard.charts) {
        Object.values(window.dashboard.charts).forEach(chart => {
            chart.resize();
        });
    }
});

// Manufacturing Control Center Class
class ManufacturingControlCenter {
    constructor() {
        this.isAnimationRunning = true;
        this.alerts = [];
        this.sensorData = {
            temperature: { current: 23.5, history: [] },
            pressure: { current: 4.8, history: [] },
            vibration: { current: 2.1, history: [] },
            energy: { current: 142.8, history: [] }
        };
        this.equipmentStatus = new Map();
        this.productionMetrics = {
            currentOutput: 156,
            efficiency: 87.5,
            targetVsActual: 94.2
        };
    }

    init() {
        this.initializeRealTimeClock();
        this.initializeAlerts();
        this.initializeSensorMonitoring();
        this.initializeEquipmentMonitoring();
        this.initializeProcessFlow();
        this.initializeHeatmap();
        this.bindControlEvents();
        this.startDataSimulation();
    }

    initializeRealTimeClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ko-KR', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const clockElement = document.getElementById('realTimeClock');
            if (clockElement) {
                clockElement.textContent = timeString;
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    initializeAlerts() {
        // Add initial alerts
        this.addAlert('high', 'Assembly Robot 1: Sensor fault detected');
        this.addAlert('medium', 'Production Line 2: Scheduled maintenance in 45 minutes');
        this.addAlert('low', 'Quality Check: Reject rate slightly elevated (2.1%)');
        
        this.renderAlerts();
    }

    addAlert(severity, message) {
        const alert = {
            id: Date.now(),
            severity: severity,
            message: message,
            timestamp: new Date()
        };
        this.alerts.unshift(alert);
        
        // Keep only last 10 alerts
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(0, 10);
        }
        
        this.renderAlerts();
    }

    renderAlerts() {
        const alertList = document.getElementById('alertList');
        if (!alertList) return;

        if (this.alerts.length === 0) {
            alertList.innerHTML = '<div style="color: #48bb78; text-align: center; padding: 20px;">✅ No active alerts</div>';
            return;
        }

        alertList.innerHTML = this.alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-severity ${alert.severity}"></div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${alert.timestamp.toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    }

    initializeSensorMonitoring() {
        // Initialize sensor data history
        const now = Date.now();
        Object.keys(this.sensorData).forEach(sensor => {
            for (let i = 29; i >= 0; i--) {
                this.sensorData[sensor].history.push({
                    timestamp: now - (i * 60000), // 1 minute intervals
                    value: this.sensorData[sensor].current + (Math.random() - 0.5) * 2
                });
            }
        });

        this.renderSensorCharts();
    }

    renderSensorCharts() {
        Object.keys(this.sensorData).forEach(sensor => {
            const chartElement = document.getElementById(`${sensor}Chart`);
            if (!chartElement) return;

            // Clear existing content
            chartElement.innerHTML = '';
            
            const canvas = document.createElement('canvas');
            canvas.width = chartElement.offsetWidth || 180;
            canvas.height = 40;
            chartElement.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            const history = this.sensorData[sensor].history;
            const values = history.map(h => h.value);
            
            if (values.length === 0) return;
            
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1; // Avoid division by zero

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background grid
            ctx.strokeStyle = 'rgba(74, 85, 104, 0.3)';
            ctx.lineWidth = 1;
            
            // Horizontal grid lines
            for (let i = 0; i <= 4; i++) {
                const y = (i / 4) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Vertical grid lines
            for (let i = 0; i <= 6; i++) {
                const x = (i / 6) * canvas.width;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Draw data line
            ctx.strokeStyle = '#4299e1';
            ctx.lineWidth = 2;
            ctx.beginPath();

            values.forEach((value, index) => {
                const x = (index / Math.max(values.length - 1, 1)) * canvas.width;
                const y = canvas.height - ((value - min) / range) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#4299e1';
            values.forEach((value, index) => {
                const x = (index / Math.max(values.length - 1, 1)) * canvas.width;
                const y = canvas.height - ((value - min) / range) * canvas.height;
                
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // Draw fill area
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#4299e1';
            ctx.beginPath();
            
            values.forEach((value, index) => {
                const x = (index / Math.max(values.length - 1, 1)) * canvas.width;
                const y = canvas.height - ((value - min) / range) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, canvas.height);
                    ctx.lineTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.globalAlpha = 1.0;
        });
    }

    initializeEquipmentMonitoring() {
        const equipmentItems = document.querySelectorAll('.equipment-item');
        equipmentItems.forEach(item => {
            item.addEventListener('click', () => {
                const equipmentId = item.dataset.equipment;
                this.showEquipmentDetails(equipmentId);
            });
        });
    }

    showEquipmentDetails(equipmentId) {
        console.log(`Showing details for equipment: ${equipmentId}`);
        // In a real application, this would open a detailed view
    }

    initializeProcessFlow() {
        // Add hover effects and click handlers to process stages
        const processStages = document.querySelectorAll('.process-stage');
        processStages.forEach(stage => {
            stage.addEventListener('click', () => {
                const stageNumber = stage.dataset.stage;
                this.showStageDetails(stageNumber);
            });
        });
    }

    showStageDetails(stageNumber) {
        console.log(`Showing details for process stage: ${stageNumber}`);
        // In a real application, this would show detailed metrics for the stage
    }

    initializeHeatmap() {
        const heatmapGrid = document.getElementById('anomalyHeatmap');
        if (!heatmapGrid) return;

        // Generate 24 hours of heatmap data (1 cell per hour)
        for (let hour = 0; hour < 24; hour++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            // Random severity for demo
            const severity = Math.random();
            if (severity > 0.9) cell.classList.add('critical');
            else if (severity > 0.7) cell.classList.add('warning');
            else cell.classList.add('normal');

            cell.title = `Hour ${hour}: ${severity > 0.9 ? 'Critical' : severity > 0.7 ? 'Warning' : 'Normal'}`;
            
            heatmapGrid.appendChild(cell);
        }

        // Add timeline
        const timeline = document.getElementById('heatmapTimeline');
        if (timeline) {
            timeline.innerHTML = ['00:00', '06:00', '12:00', '18:00', '24:00']
                .map(time => `<span>${time}</span>`).join('');
        }
    }

    bindControlEvents() {
        // Emergency stop button
        const emergencyStop = document.getElementById('emergencyStop');
        if (emergencyStop) {
            emergencyStop.addEventListener('click', () => {
                this.handleEmergencyStop();
            });
        }

        // Time range selector
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                timeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateProductionStats(btn.dataset.range);
            });
        });
    }

    handleEmergencyStop() {
        if (confirm('⚠️ Are you sure you want to trigger emergency stop? This will halt all production lines.')) {
            this.addAlert('high', 'EMERGENCY STOP ACTIVATED - All production lines halted');
            
            // Update system status
            const systemStatus = document.getElementById('systemStatus');
            if (systemStatus) {
                systemStatus.className = 'status-indicator error';
                systemStatus.innerHTML = '<div class="status-dot"></div><span>EMERGENCY STOP</span>';
            }
        }
    }

    updateProductionStats(timeRange) {
        console.log(`Updating production stats for range: ${timeRange}`);
        
        // Generate different data based on time range
        let dataPoints, chartLabels;
        
        switch (timeRange) {
            case '1h':
                dataPoints = 12; // 5-minute intervals
                chartLabels = this.generateTimeLabels(dataPoints, 5); // 5 minutes
                break;
            case '8h':
                dataPoints = 16; // 30-minute intervals
                chartLabels = this.generateTimeLabels(dataPoints, 30); // 30 minutes
                break;
            case '24h':
                dataPoints = 24; // 1-hour intervals
                chartLabels = this.generateTimeLabels(dataPoints, 60); // 1 hour
                break;
            default:
                dataPoints = 12;
                chartLabels = this.generateTimeLabels(dataPoints, 5);
        }
        
        // Update production charts with new data
        this.updateProductionCharts(dataPoints, chartLabels, timeRange);
        
        // Update production metrics based on time range
        this.updateMetricsByTimeRange(timeRange);
    }

    generateTimeLabels(points, intervalMinutes) {
        const labels = [];
        const now = new Date();
        
        for (let i = points - 1; i >= 0; i--) {
            const time = new Date(now - i * intervalMinutes * 60000);
            labels.push(time.getHours().toString().padStart(2, '0') + ':' + 
                       time.getMinutes().toString().padStart(2, '0'));
        }
        
        return labels;
    }

    updateProductionCharts(dataPoints, labels, timeRange) {
        // Update mini production charts
        ['production', 'target', 'efficiency'].forEach(type => {
            const chartKey = type + 'Chart';
            if (window.anomalyDashboard && window.anomalyDashboard.charts[chartKey]) {
                const chart = window.anomalyDashboard.charts[chartKey];
                
                // Generate new data based on time range
                const newData = this.generateTimeSeriesData(dataPoints, type);
                
                // Update chart data
                chart.data.labels = newData.labels;
                chart.data.datasets[0].data = newData.values;
                chart.update('active');
            }
        });
    }

    updateMetricsByTimeRange(timeRange) {
        let multiplier = 1;
        
        switch (timeRange) {
            case '1h':
                multiplier = 0.8; // Lower values for 1 hour
                break;
            case '8h':
                multiplier = 1.0; // Normal values
                break;
            case '24h':
                multiplier = 1.2; // Higher values for 24 hours
                break;
        }
        
        // Update displayed metrics
        const currentOutput = document.getElementById('currentOutput');
        if (currentOutput) {
            const baseOutput = 156;
            currentOutput.textContent = Math.round(baseOutput * multiplier) + ' units/hr';
        }
        
        const targetVsActual = document.getElementById('targetVsActual');
        if (targetVsActual) {
            const basePercentage = 94.2;
            targetVsActual.textContent = (basePercentage * multiplier).toFixed(1) + '% of target';
        }
        
        const efficiencyScore = document.getElementById('efficiencyScore');
        if (efficiencyScore) {
            const baseEfficiency = 87.5;
            efficiencyScore.textContent = (baseEfficiency * multiplier).toFixed(1) + '%';
        }
    }

    startDataSimulation() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateSensorData();
            this.updateProductionMetrics();
            this.simulateRandomEvents();
        }, 5000); // Update every 5 seconds
    }

    updateSensorData() {
        const now = Date.now();
        
        Object.keys(this.sensorData).forEach(sensor => {
            // Add small random variation
            const variation = (Math.random() - 0.5) * 0.2;
            this.sensorData[sensor].current += variation;

            // Add to history
            this.sensorData[sensor].history.push({
                timestamp: now,
                value: this.sensorData[sensor].current
            });

            // Keep only last 30 data points
            if (this.sensorData[sensor].history.length > 30) {
                this.sensorData[sensor].history.shift();
            }

            // Update display
            const element = document.getElementById(sensor);
            if (element) {
                let value = this.sensorData[sensor].current;
                let unit = '';
                
                switch(sensor) {
                    case 'temperature':
                        unit = '°C';
                        value = value.toFixed(1);
                        break;
                    case 'pressure':
                        unit = ' bar';
                        value = value.toFixed(1);
                        break;
                    case 'vibration':
                        unit = ' mm/s';
                        value = value.toFixed(1);
                        break;
                    case 'energy':
                        unit = ' kW';
                        value = value.toFixed(1);
                        break;
                }
                
                element.textContent = `${value}${unit}`;
            }
        });

        this.renderSensorCharts();
    }

    updateProductionMetrics() {
        // Simulate production metric updates
        this.productionMetrics.currentOutput += (Math.random() - 0.5) * 5;
        this.productionMetrics.efficiency += (Math.random() - 0.5) * 1;
        this.productionMetrics.targetVsActual += (Math.random() - 0.5) * 2;

        // Update displays
        const currentOutput = document.getElementById('currentOutput');
        if (currentOutput) {
            currentOutput.textContent = `${Math.round(this.productionMetrics.currentOutput)} units/hr`;
        }

        const efficiencyScore = document.getElementById('efficiencyScore');
        if (efficiencyScore) {
            efficiencyScore.textContent = `${this.productionMetrics.efficiency.toFixed(1)}%`;
        }

        const targetVsActual = document.getElementById('targetVsActual');
        if (targetVsActual) {
            targetVsActual.textContent = `${this.productionMetrics.targetVsActual.toFixed(1)}% of target`;
        }

        // Update production rate
        const productionRate = document.getElementById('productionRate');
        if (productionRate) {
            productionRate.textContent = Math.round(this.productionMetrics.currentOutput);
        }
    }

    simulateRandomEvents() {
        // Occasionally add new alerts
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
            const messages = [
                'Quality checkpoint: Minor deviation detected',
                'Conveyor system: Speed adjustment completed',
                'Production target: 5% above expected output',
                'Maintenance reminder: Line 3 due for service',
                'Energy efficiency: Operating within optimal range'
            ];
            
            const severities = ['low', 'medium'];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
            
            this.addAlert(randomSeverity, randomMessage);
        }
    }
}

// Global functions for button handlers
function toggleProcessAnimation() {
    const button = document.getElementById('animationToggle');
    if (window.manufacturingControl) {
        if (window.manufacturingControl.isAnimationRunning) {
            window.manufacturingControl.isAnimationRunning = false;
            if (button) button.textContent = '▶️ Resume';
            // Pause animations
            document.querySelectorAll('.flow-particle').forEach(particle => {
                particle.style.animationPlayState = 'paused';
            });
        } else {
            window.manufacturingControl.isAnimationRunning = true;
            if (button) button.textContent = '⏸️ Pause';
            // Resume animations
            document.querySelectorAll('.flow-particle').forEach(particle => {
                particle.style.animationPlayState = 'running';
            });
        }
    }
}

function clearAllAlerts() {
    if (window.manufacturingControl) {
        window.manufacturingControl.alerts = [];
        window.manufacturingControl.renderAlerts();
    }
}

function refreshEquipmentStatus() {
    console.log('Refreshing equipment status...');
    
    // Visual feedback
    const refreshBtn = event.target;
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate refresh with visual feedback
    setTimeout(() => {
        // Update equipment metrics randomly
        document.querySelectorAll('.equipment-item').forEach(item => {
            const metrics = item.querySelectorAll('.equipment-metrics span');
            metrics.forEach(metric => {
                if (metric.textContent.includes('Efficiency:')) {
                    const newValue = (90 + Math.random() * 10).toFixed(1);
                    metric.textContent = `Efficiency: ${newValue}%`;
                } else if (metric.textContent.includes('Uptime:')) {
                    const newValue = (120 + Math.random() * 20).toFixed(1);
                    metric.textContent = `Uptime: ${newValue}h`;
                }
            });
        });
        
        // Add refresh alert
        if (window.manufacturingControl) {
            window.manufacturingControl.addAlert('low', 'Equipment status refreshed successfully');
        }
        
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }, 1500);
}

function toggleEquipmentView() {
    console.log('Toggling equipment view...');
    
    const equipmentGrid = document.querySelector('.equipment-grid');
    const toggleBtn = event.target;
    
    if (equipmentGrid.classList.contains('detailed-view')) {
        equipmentGrid.classList.remove('detailed-view');
        toggleBtn.textContent = '📋 Details';
        
        // Hide detailed metrics
        document.querySelectorAll('.equipment-detailed-info').forEach(detail => {
            detail.style.display = 'none';
        });
    } else {
        equipmentGrid.classList.add('detailed-view');
        toggleBtn.textContent = '📊 Simple';
        
        // Show detailed metrics
        document.querySelectorAll('.equipment-item').forEach(item => {
            let detailedInfo = item.querySelector('.equipment-detailed-info');
            if (!detailedInfo) {
                detailedInfo = document.createElement('div');
                detailedInfo.className = 'equipment-detailed-info';
                detailedInfo.innerHTML = `
                    <div class="detailed-metric">Last Maintenance: ${Math.floor(Math.random() * 30)} days ago</div>
                    <div class="detailed-metric">Next Service: ${Math.floor(Math.random() * 15)} days</div>
                    <div class="detailed-metric">Total Runtime: ${Math.floor(Math.random() * 5000)}h</div>
                    <div class="detailed-metric">Energy Usage: ${(Math.random() * 50 + 100).toFixed(1)}kW</div>
                `;
                item.appendChild(detailedInfo);
            }
            detailedInfo.style.display = 'block';
        });
    }
}

function toggleHeatmapMode() {
    console.log('Toggling heatmap mode...');
    
    const heatmapGrid = document.getElementById('anomalyHeatmap');
    const toggleBtn = event.target;
    
    if (heatmapGrid.classList.contains('hourly-view')) {
        // Switch to daily view
        heatmapGrid.classList.remove('hourly-view');
        heatmapGrid.classList.add('daily-view');
        toggleBtn.textContent = 'Hourly View';
        
        // Clear and regenerate with 7 days
        heatmapGrid.innerHTML = '';
        heatmapGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            const severity = Math.random();
            if (severity > 0.8) cell.classList.add('critical');
            else if (severity > 0.6) cell.classList.add('warning');
            else cell.classList.add('normal');
            
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            cell.title = `${dayNames[day]}: ${severity > 0.8 ? 'Critical' : severity > 0.6 ? 'Warning' : 'Normal'}`;
            
            heatmapGrid.appendChild(cell);
        }
        
        // Update timeline
        const timeline = document.getElementById('heatmapTimeline');
        if (timeline) {
            timeline.innerHTML = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                .map(day => `<span>${day}</span>`).join('');
        }
    } else {
        // Switch to hourly view
        heatmapGrid.classList.add('hourly-view');
        heatmapGrid.classList.remove('daily-view');
        toggleBtn.textContent = 'Daily View';
        
        // Reinitialize hourly view
        if (window.manufacturingControl) {
            window.manufacturingControl.initializeHeatmap();
        }
    }
}

function exportData() {
    console.log('Exporting data...');
    
    const exportBtn = event.target;
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '📤 Exporting...';
    exportBtn.disabled = true;
    
    // Simulate export process
    setTimeout(() => {
        // In a real application, this would generate and download a CSV file
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Timestamp,Temperature,Pressure,Vibration,Energy\n"
            + "2025-08-27 12:00:00,23.5,4.8,2.1,142.8\n"
            + "2025-08-27 12:01:00,23.6,4.7,2.0,143.1\n"
            + "2025-08-27 12:02:00,23.4,4.9,2.2,142.5\n";
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "dashboard_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (window.manufacturingControl) {
            window.manufacturingControl.addAlert('low', 'Data export completed successfully');
        }
        
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    }, 2000);
}

// Initialize manufacturing control center
function initializeManufacturingDashboard() {
    // Store reference globally for button handlers
    window.manufacturingControl = new ManufacturingControlCenter();
    window.manufacturingControl.init();
    
    // Initialize scroll features
    initializeScrollFeatures();
}

// Scroll Features Implementation
function initializeScrollFeatures() {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;

    // Create scroll indicator
    createScrollIndicator();
    
    // Initialize intersection observer for fade-in effects
    initializeIntersectionObserver();
    
    // Add scroll event listeners
    dashboardContent.addEventListener('scroll', handleScroll);
}

function createScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = '<div class="scroll-progress"></div>';
    document.body.appendChild(indicator);
}

function handleScroll() {
    const dashboardContent = document.querySelector('.dashboard-content');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!dashboardContent) return;

    const scrollTop = dashboardContent.scrollTop;
    const scrollHeight = dashboardContent.scrollHeight - dashboardContent.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    // Update scroll progress
    if (scrollProgress) {
        scrollProgress.style.height = `${scrollPercent}%`;
    }

    // Show/hide scroll indicator
    if (scrollIndicator) {
        if (scrollHeight > 0) {
            scrollIndicator.classList.add('visible');
            
            // Hide after 2 seconds of no scrolling
            clearTimeout(window.scrollTimeout);
            window.scrollTimeout = setTimeout(() => {
                scrollIndicator.classList.remove('visible');
            }, 2000);
        } else {
            scrollIndicator.classList.remove('visible');
        }
    }

    // Show/hide scroll to top button
    if (scrollToTopBtn) {
        if (scrollTop > 300) { // Show after scrolling 300px
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
}

function initializeIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

// Smooth scroll to top function
function scrollToTop() {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent) {
        dashboardContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Smooth scroll to section function
function scrollToSection(sectionId) {
    const dashboardContent = document.querySelector('.dashboard-content');
    const section = document.getElementById(sectionId);
    
    if (dashboardContent && section) {
        const offsetTop = section.offsetTop - 100; // 100px offset for header
        dashboardContent.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Add keyboard shortcuts for scroll navigation
document.addEventListener('keydown', function(event) {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    switch(event.key) {
        case 'Home':
            event.preventDefault();
            scrollToTop();
            break;
        case 'End':
            event.preventDefault();
            dashboardContent.scrollTo({
                top: dashboardContent.scrollHeight,
                behavior: 'smooth'
            });
            break;
        case 'PageUp':
            event.preventDefault();
            dashboardContent.scrollBy({
                top: -window.innerHeight * 0.8,
                behavior: 'smooth'
            });
            break;
        case 'PageDown':
            event.preventDefault();
            dashboardContent.scrollBy({
                top: window.innerHeight * 0.8,
                behavior: 'smooth'
            });
            break;
    }
});

// Extend AnomalyDashboard class with update method
AnomalyDashboard.prototype.updateWithNewData = function() {
    // Simulate new anomaly detection data
    // In a real application, this would fetch from your API endpoint
    const simulatedData = this.generateSimulatedData();
    
    // Update the data
    this.data = simulatedData;
    
    // Update the summary cards
    this.updateSummaryCards();
    
    // Update charts if they exist
    if (this.charts.scoresChart) {
        this.updateScoresChart();
    }
    
    if (this.charts.yieldChart) {
        this.updateYieldChart();
    }
    
    console.log('Dashboard updated with new anomaly detection data');
};

AnomalyDashboard.prototype.generateSimulatedData = function() {
    // Generate some variation in the data to simulate real-time updates
    const variation = 0.1; // 10% variation
    const newData = JSON.parse(JSON.stringify(this.data)); // Deep copy
    
    // Slightly modify anomaly scores
    newData.anomaly_scores.normal_scores = newData.anomaly_scores.normal_scores.map(score => {
        const change = (Math.random() - 0.5) * variation;
        return Math.max(0, Math.min(1, score + change));
    });
    
    // Update timestamp
    newData.metadata.timestamp = new Date().toISOString().replace(/[:-]/g, '').slice(0, 15);
    
    // Randomly add/remove anomalies
    if (Math.random() < 0.3) { // 30% chance to change anomaly count
        newData.metadata.anomaly_count = Math.max(0, newData.metadata.anomaly_count + (Math.random() > 0.5 ? 1 : -1));
    }
    
    return newData;
};

AnomalyDashboard.prototype.updateScoresChart = function() {
    if (!this.charts.scoresChart) return;
    
    const { anomaly_scores } = this.data;
    const allScores = [...anomaly_scores.normal_scores, ...anomaly_scores.anomaly_scores];
    
    this.charts.scoresChart.data.datasets[0].data = allScores;
    this.charts.scoresChart.data.datasets[1].data = new Array(allScores.length).fill(anomaly_scores.threshold);
    this.charts.scoresChart.update('none'); // Update without animation for real-time feel
};

AnomalyDashboard.prototype.updateYieldChart = function() {
    if (!this.charts.yieldChart) return;
    
    const { yield_analysis } = this.data;
    const data = yield_analysis.final_yield.map((yield_val, idx) => ({
        x: yield_val,
        y: yield_analysis.anomaly_score[idx]
    }));
    
    this.charts.yieldChart.data.datasets[0].data = data;
    this.charts.yieldChart.update('none'); // Update without animation for real-time feel
};

// Global functions for dashboard interactions
function refreshAnomalyData() {
    console.log('Refreshing anomaly data...');
    if (window.anomalyDashboard) {
        window.anomalyDashboard.updateWithNewData();
    }
}

function refreshEquipmentStatus() {
    console.log('Refreshing equipment status...');
    // Simulate equipment status update
    const equipmentItems = document.querySelectorAll('.equipment-item');
    equipmentItems.forEach(item => {
        const status = item.querySelector('.equipment-status');
        const indicator = item.querySelector('.equipment-indicator');
        
        // Randomly change some equipment status
        if (Math.random() < 0.3) {
            const statuses = ['RUNNING', 'MAINTENANCE', 'OFFLINE'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            status.textContent = newStatus;
            status.className = `equipment-status ${newStatus.toLowerCase()}`;
            indicator.className = `equipment-indicator ${newStatus.toLowerCase()}`;
        }
    });
}

function toggleEquipmentView() {
    console.log('Toggling equipment view...');
    const equipmentGrid = document.querySelector('.equipment-grid');
    if (equipmentGrid) {
        equipmentGrid.classList.toggle('detailed-view');
    }
}

function toggleHeatmapMode() {
    console.log('Toggling heatmap mode...');
    const heatmap = document.getElementById('anomalyHeatmap');
    if (heatmap) {
        heatmap.classList.toggle('intensity-mode');
    }
}

function refreshAnomalyData() {
    console.log('Refreshing anomaly detection data...');
    // Trigger dashboard update
    if (window.anomalyDashboard) {
        window.anomalyDashboard.updateWithNewData();
    }
}

function toggleHeatmapMode() {
    console.log('Toggling heatmap mode');
    // Implement heatmap mode switching logic
}

// Make dashboard instance globally accessible
window.anomalyDashboard = null;
