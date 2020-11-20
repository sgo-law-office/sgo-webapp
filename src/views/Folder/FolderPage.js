import React from "react";
import { Switch, Route } from "react-router-dom";
import FolderCreate from "./FolderCreate";
import FolderDetails from "./FolderDetails";
import FolderSearch from "./FolderSearch";

class FolderPage extends React.Component {

    render() {
        return (
            <div>
                <Switch>
                    <Route path="/admin/folders/create" component={FolderCreate}></Route>
                    <Route path="/admin/folders/:id" component={FolderDetails}></Route>
                    <Route path="/admin/folders" component={FolderSearch}></Route>
                </Switch>
            </div>
        );
    }
}


export default FolderPage;
