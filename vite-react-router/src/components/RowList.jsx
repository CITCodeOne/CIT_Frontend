import { Container, Row } from 'react-bootstrap';

/**
 * RowComp - Unified list/grid component using React Bootstrap
 * 
 * Replaces both ListComp and GridListComp with a single flexible component.
 * Provides exact visual match to the old components.
 * 
 * @param {Array} items - Array of items to render
 * @param {Function} renderItem - Function that returns a component for each item
 * @param {string} variant - Layout variant: 'list' or 'grid' (default: 'grid')
 * @param {string} className - Additional classes for the container/row
 * @param {string} itemClassName - Additional classes for list items (only for 'list' variant)
 * @param {string} emptyMessage - Message to show when no items (default: 'No items to display')
 * 
 * Variants:
 * - 'grid': Bootstrap Row layout - renderItem should return Col components (like MediaCard)
 * - 'list': Container with divs - renderItem can return any component
 * 
 * Examples:
 * 
 * // Grid variant (replaces GridListComp) - items are already Col components
 * <RowComp
 *   variant="grid"
 *   items={cast}
 *   renderItem={(actor) => (
 *     <MediaCard
 *       key={actor.id}
 *       id={actor.id}
 *       type="person"
 *       image={actor.profilePath}
 *       title={actor.name}
 *     />
 *   )}
 * />
 * 
 * // List variant (replaces ListComp) - simple vertical list
 * <RowComp
 *   variant="list"
 *   items={reviews}
 *   renderItem={(review) => <UserCard {...review} />}
 * />
 */
export default function RowComp({ 
  items = [], 
  renderItem,
  variant = 'grid',
  className = '',
  itemClassName = 'my-2',
  emptyMessage = 'No items to display'
}) {
  if (!items.length) {
    return (
      <div className="alert alert-info">
        {emptyMessage}
      </div>
    );
  }

  // Grid variant - uses Bootstrap Row (exactly like GridListComp)
  // renderItem should return Col components
  if (variant === 'grid') {
    return (
      <Row className={className || 'justify-content-start'}>
        {items.map((item, index) => renderItem(item, index))}
      </Row>
    );
  }

  // List variant - uses Container with divs (exactly like ListComp)
  // renderItem can return any component
  return (
    <Container className={`overflow-auto ${className}`}>
      {items.map((item, index) => (
        <div key={item.id || index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </Container>
  );
}
