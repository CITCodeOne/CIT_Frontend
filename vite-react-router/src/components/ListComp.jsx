import { Container, Card } from "react-bootstrap";

/**
 * Simple, reusable list component
 */
export default function SimpleList({ 
  items = [], 
  renderItem,
  className = "",
  itemClassName = "my-2"
}) {
  if (!items.length) {
    return (
      <div className="alert alert-info">
        No items to display
      </div>
    );
  }

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