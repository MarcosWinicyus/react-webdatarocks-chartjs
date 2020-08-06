import React, {Component} from 'react';
import language from './config/pr.json';
import { Spin} from 'antd';
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

    async initializeList(aqp) {
        this.setState(previousState => {
            return { ...previousState, loadingData: true };
        });

        const bolsao = await BolsaoServices.listAll({
            limit: -1,
            status: [true, false]
        });

        this.setState(prev => ({
            ...prev,
            loadingData: false,
            data: bolsao.docs
        }), () => this.processDataTable(bolsao.docs));
    }

    async componentDidMount() {
        await this.initializeList();
    }

    processDataTable = (bolsao) => {
        let table = []

        bolsao && bolsao.forEach( (item) => {
        let nome_bolsao = item.nome
        let safra = item.safra.descricao

        item && item.grupo_produto && item.grupo_produto.forEach( (gp) => {
            let grupo_produto = gp.nome
            gp && gp.produtos && gp.produtos.forEach( (pd) => {
            let produto = pd.nome
            if (pd && pd.variacoes && pd.variacoes.length > 0){
                pd.variacoes.forEach( (vr) => {
                let peneira = vr.peneira
                let bolsao_valor = vr.bolsao_valor
                let saldo = vr.saldo
                let vendas = vr.vendas
                let embalagem = ' '
                if(vr.embalagem){
                    embalagem = vr.embalagem
                }
                
                table.push({
                    'safra':safra,
                    'nome_bolsao':nome_bolsao,
                    'grupo_produto':grupo_produto,
                    'produto':produto,
                    'peneira':peneira,
                    'bolsao_valor':bolsao_valor,
                    'saldo':saldo,
                    'vendas':vendas,
                    'embalagem':embalagem
                })
                
                })
            }
            })
        })
        })

        this.setState({
            table: table,
            gerar_table: true
        })

    }

    prepareDataFunction = (rawData) => {
        let result = {}
        let labels = []
        let data = [] 

        rawData && rawData.data && rawData.data.forEach( raw => {
            if (raw.c0 !== undefined && raw.r0 == undefined && raw.v0 !== undefined) {
                labels.push(raw.c0);
                data.push(raw.v0)

            }
        })
        
        result.labels = labels
        result.data = data
        // result.label = rawData.meta.v0Name
        result.label = 'Total Produtos'

        return result
    }

    getData = () => {
        return this.state.table
    }

    onReportComplete = () => {
        webdatarocks.getData({
                    "slice": {
                        "reportFilters": [
                            {
                                "uniqueName": "nome_bolsao"
                            }
                        ],
                        "rows": [
                            {
                                "uniqueName": "produto"
                            }
                        ],
                        "columns": [
                            {
                                "uniqueName": "Measures"
                            },
                            {
                                "uniqueName": "peneira"
                            }
                        ],
                        "measures": [
                            {
                                "uniqueName": "saldo",
                                "aggregation": "count",
                                "availableAggregations": [
                                    "count",
                                    "distinctcount"
                                ]
                            }
                        ]
                    },
        }, this.drawDoughnutChart, this.updateDoughnutChart);
        
    }

    drawDoughnutChart = (rawData) => {

        var data = this.prepareDataFunction(rawData);

        console.log(rawData)

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

    updateDoughnutChart = (rawData) => {

        this.setState({
            gerar_chart: false,
            data_chart:{}
        })

        this.drawDoughnutChart(rawData)
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
                                "dataSource":{ "data" : this.getData()},  
                                "slice": {
                                    "reportFilters": [
                                        {
                                            "uniqueName": "nome_bolsao"
                                        }
                                    ],
                                    "rows": [
                                        {
                                            "uniqueName": "produto"
                                        }
                                    ],
                                    "columns": [
                                        {
                                            "uniqueName": "Measures"
                                        },
                                        {
                                            "uniqueName": "peneira"
                                        }
                                    ],
                                    "measures": [
                                        {
                                            "uniqueName": "saldo",
                                            "aggregation": "count",
                                            "availableAggregations": [
                                                "count",
                                                "distinctcount"
                                            ]
                                        }
                                    ]
                                },
                                "options": {
                                    "grid": {
                                        "title": "Bolsão Saldo"
                                    },
                                    "configuratorButton":false
                                }
                            }} 
                            global={{"localization": language}}
                            beforetoolbarcreated={this.customizeToolbar}
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
                    <div className='chart_bolsao'>
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
                                            return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.value.toString().split(".").join(",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' SC'
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
                                title: {
                                    display: true,
                                    text: 'Quantidade Produtos por Peneira',
                                    fontSize: 25
                                },
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
