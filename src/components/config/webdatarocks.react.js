import * as React from "react";
import ReactDOM from "react-dom";
import Webdatarocks from "webdatarocks";
import "webdatarocks/webdatarocks.min.css";

export class Pivot extends React.Component{

		webdatarocks; 

		componentDidMount() {
			webdatarocks = new Webdatarocks({
				...this.props,
				container: ReactDOM.findDOMNode(this)
			});
		}
		
		shouldComponentUpdate() {
			return false;
		}
		
		componentWillUnmount() {
			webdatarocks.dispose();
		}
	
		render() {
			return <div>Pivot</div>;
		}

	}

