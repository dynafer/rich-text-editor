import ImageAdjustableEdge from './image/AdjustableEdge';
import ImageAdjustableLine from './image/AdjustableLine';
import TableAdjustableEdge from './table/AdjustableEdge';
import TableAdjustableLine from './table/AdjustableLine';
import TableMovable from './table/Movable';

export default {
	Image: {
		name: 'img',
		partAttachers: [ImageAdjustableLine, ImageAdjustableEdge]
	},
	Table: {
		name: 'table',
		partAttachers: [TableMovable, TableAdjustableEdge, TableAdjustableLine]
	}
};
