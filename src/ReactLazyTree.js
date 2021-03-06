import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash.omit';
import noop from 'lodash.noop';
import TreeNode from './TreeNode';
import { findFirstNode } from './search';

class ReactLazyTree extends React.Component {
    /* istanbul ignore next */
    constructor(props) {
        super(props);

        const { childrenPropertyName, data, mapInitialActiveNode } = props;
        let activePath = '';
        if (typeof mapInitialActiveNode === 'function') {
            activePath = findFirstNode(
                this.normalizeData(data),
                mapInitialActiveNode,
                childrenPropertyName
            );
        }

        this.state = {
            activePath
        };

        this.onActiveNodeChanged = this.onActiveNodeChanged.bind(this);

        this.isTouchEnv = false;
    }

    onActiveNodeChanged(e, node, depth, index, path) {
        const { activePath } = this.state;
        const { interactiveStartDepth } = this.props;

        if (this.isOnActivePath(path, activePath, depth)) {
            path = this.slicePathAtDepth(path, depth);
        }

        if (depth >= interactiveStartDepth && interactiveStartDepth !== -1) {
            this.setState({
                activePath: path
            });
        }

        this.props.onActiveNodeChanged({ e, node, depth, index, activePath: path });
    }

    isOnActivePath(path, activePath, depth) {
        const ap = this.slicePathAtDepth(activePath, depth + 1);
        const p = this.slicePathAtDepth(path, depth + 1);
        return ap === p;
    }

    slicePathAtDepth(path, depth) {
        return path.split(',').slice(0, depth).join();
    }

    normalizeData(data) {
        if (!Array.isArray(data)) {
            return [data];
        }

        return data;
    }

    render() {
        const omitions = ['isInteractive', 'mapInitialActiveNode', 'data'];

        return (
            <TreeNode {...omit(this.props, omitions)} {...{
                activePath: this.state.activePath,
                node: this.normalizeData(this.props.data),
                onActiveNodeChanged: this.onActiveNodeChanged
            }} />
        );
    }
}

ReactLazyTree.propTypes = {
    childrenPropertyName: PropTypes.string,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    interactiveStartDepth: PropTypes.number,
    mapInitialActiveNode: PropTypes.func,
    mapListClassName: PropTypes.func,
    mapListItemClassName: PropTypes.func,
    mapNodeContent: PropTypes.func.isRequired,
    onActiveNodeChanged: PropTypes.func,
    shouldLazyRender: PropTypes.bool,
    shouldShowAllNodes: PropTypes.bool,
    verticalAnimationConfig: PropTypes.shape({
        durationInMs: PropTypes.number,
        timing: PropTypes.string
    })
};

ReactLazyTree.defaultProps = {
    childrenPropertyName: 'children',
    interactiveStartDepth: 0,
    onActiveNodeChanged: noop
};

export default ReactLazyTree;
