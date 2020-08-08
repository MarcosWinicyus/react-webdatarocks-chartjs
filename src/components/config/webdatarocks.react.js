import * as React from "react";
import ReactDOM from "react-dom";
import Webdatarocks from "webdatarocks";
import "webdatarocks/webdatarocks.min.css";

window.webdatarocks = {}

export class Pivot extends React.Component{

	componentDidMount() {
		window.webdatarocks = new Webdatarocks({
			...this.props,
			container: ReactDOM.findDOMNode(this)
		});
	}
	
	shouldComponentUpdate() {
		return false;
	}
	
	componentWillUnmount() {
		window.webdatarocks.dispose();
	}

	render() {
		return <div>Pivot</div>;
	}

}

