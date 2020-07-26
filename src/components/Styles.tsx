import styled from "styled-components";

export const Settings = styled.div`
  position: absolute;
  top: 20px;
  width: 100%;
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  z-index: 9999;
`;

export const Child = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

export const Select = styled.select`
  padding: 5px;
  font-size: 18px;
  box-shadow: 0 0 6px 0 rgba(32, 32, 36, 0.18);
  border: none;
  outline: none;
`;

export const Button = styled.button`
  cursor: pointer;
  background-color: ${(props) => (props.disabled ? "#e8e8e8" : "#333")};
  // padding: 0.85rem 1.85rem;
  padding: 8px 16px;
  color: ${(props) => (props.disabled ? "#c7c7c7" : "white")};
  box-shadow: 0 0 6px 0 rgba(32, 32, 36, 0.18);
  border: 0;
  font-size: 16px;
  font-weight: bold;
  outline: none;
`;
