import { Row } from "react-bootstrap";

/**
 * Grid List Component - for Bootstrap Row/Col grid layouts
 * 
 * This component renders items in a Bootstrap grid (Row/Col).
 * Unlike ListComp, it doesn't wrap items - they must be Col components.
 * 
 * @param {Array} items - Array of items to render
 * @param {Function} renderItem - Function that returns a Col component for each item
 * @param {string} className - Additional classes for the Row
 */
export default function GridListComp({ 
  items = [], 
  renderItem,
  className = "justify-content-start"
}) {
  if (!items.length) {
    return (
      <div className="alert alert-info">
        No items to display
      </div>
    );
  }

  return (
    <Row className={className}>
      {items.map((item, index) => renderItem(item, index))}
    </Row>
  );
}
