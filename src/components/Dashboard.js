import React, {Component} from 'react';
import language from './config/pr.json';
import { Spin} from 'antd';
import data from './data/data.csv'
import {Bar} from 'react-chartjs-2';
import * as WebDataRocks from './config/webdatarocks.react';


class Dashboard extends Component{   

    constructor(props) {
        super(props)
        this.state = {
            loadingData: true,
            data: {},
            table: [],
            gerar_table: false,
            gerar_chart: false,
            data_chart:{},
        }
    }

    async componentDidMount() {
        await this.setState({ gerar_table: true })
    }

    prepareDataFunction = (rawData) => {
        let result = {}
        let labels = []
        let data = [] 

        rawData && rawData.data && rawData.data.forEach( raw => {
            if (raw.r0 !== undefined && raw.v0 !== undefined ) {
                labels.push(raw.r0);
                data.push(raw.v0)

            }
        })
        
        result.labels = labels
        result.data = data
        result.label = rawData.meta.v0Name

        return result
    }

    getData = () => {
        return data
    }

    onReportComplete = () => {
        window.webdatarocks.getData({
            "slice": {
                "rows": [
                    {
                        "uniqueName": "Category"
                    }
                ],
                "columns": [
                    {
                        "uniqueName": "Measures"
                    }
                ],
                "measures": [
                    {
                        "uniqueName": "Price",
                        "aggregation": "sum"
                    }
                ]
            },
        }, this.drawBarChart, this.updateBarChart);
        
    }

    drawBarChart = (rawData) => {

        var data = this.prepareDataFunction(rawData)
        let data_chart = {
            datasets: [{
                data: data.data,
                label: data.label,
                backgroundColor: "#2ecc71"
            }],
            labels: data.labels
        }
        
        this.setState({
            data_chart:data_chart,
            gerar_chart: true,
        })
    }

    updateBarChart = (rawData) => {

        this.setState({
            gerar_chart: false,
            data_chart:{}
        })

        this.drawBarChart(rawData)
    }

    customizeToolbar = (toolbar) => {
        let tabs = toolbar.getTabs()
        toolbar.getTabs = function() {
            delete tabs[0]
            delete tabs[1]
            delete tabs[2]
            delete tabs[4]
            delete tabs[5]
            delete tabs[6]
            return tabs
        }
    }

    render(){
        return(
            <div>
                {this.state.gerar_table 
                    ? <div>
                        <WebDataRocks.Pivot 
                            toolbar={true} 
                            report={{
                                "dataSource": {
                                    "dataSourceType": "csv",
                                    "filename": "https://cdn.webdatarocks.com/data/data.csv"
                                },
                                "slice": {
                                    "rows": [
                                        {
                                            "uniqueName": "Category"
                                        }
                                    ],
                                    "columns": [
                                        {
                                            "uniqueName": "Measures"
                                        }
                                    ],
                                    "measures": [
                                        {
                                            "uniqueName": "Price",
                                            "aggregation": "sum"
                                        }
                                    ]
                                }
                            }} 
                            global={{"localization": language}}
                            // beforetoolbarcreated={this.customizeToolbar}
                            reportcomplete={
                                () => this.onReportComplete()
                            }
                        />
                    </div> : 
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spin tip="Carregando..." size="large" />
                    </div>
                }
                {this.state.gerar_chart 
                    ?
                    <div className='chart'>
                        <Bar 
                            redraw={true}
                            data={this.state.data_chart}
                            options={{
                                layout: {
                                    padding: {
                                        left: 20,
                                        right: 20,
                                        top: 20,
                                        bottom: 50
                                    }
                                },
                                tooltips: {
                                    mode: 'index',
                                    callbacks: {
                                        title: function (tooltipItems, data) {
                                            return data.labels[tooltipItems[0].index]
                                        },
                                        label: function (tooltipItems, data) {
                                            return data.datasets[tooltipItems.datasetIndex].label + ': US$ ' + tooltipItems.value.toString().split(".").join(",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                        }
                                    }
                                },
                                plugins: {
                                    datalabels: {
                                        formatter: function (value) {
                                            return null
                                        }
                                    }
                                },
                                animation: false,
                                legend: {
                                    display: false
                                },
                                scales: {
                                    xAxes: [{
                                        maxBarThickness: 100,
                                        ticks: {
                                            autoSkip: false,
                                            maxRotation: 45,
                                            minRotation: 20,
                                            fontSize: 11,
                                            callback: function (tick) {
                                                if (tick.length > 20) {
                                                    return tick.substring(0, 20) + "..."
                                                } else {
                                                    return tick
                                                }
                                            }
                                        }
                                    }],
                                    yAxes: [{
                                        categoryPercentage: 0.9,
                                        barPercentage: 0.9,
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }],
                                },
                                responsive: true,
                            }} 
                        /> 
                    </div>
                    : 
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spin tip="Carregando..." size="large" />
                    </div>
                }   
            </div>
        );
    }
}

export default Dashboard;
