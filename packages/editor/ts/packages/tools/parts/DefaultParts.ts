import MediaAdjustableEdge from './media/AdjustableEdge';
import MediaAdjustableLine from './media/AdjustableLine';
import TableAdjustableEdge from './table/AdjustableEdge';
import TableAdjustableLine from './table/AdjustableLine';
import TableMovable from './table/Movable';

export default {
	Media: {
		name: 'media',
		partAttachers: [MediaAdjustableLine, MediaAdjustableEdge]
	},
	Table: {
		name: 'table',
		partAttachers: [TableMovable, TableAdjustableEdge, TableAdjustableLine]
	}
};
