import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Owner from './Owner';
import Button from '../../form/Button';
import Input from '../../form/Input';
import { getAccount } from '../../../store/selectors/account';
import { getGraphCommentParent } from '../../../store/selectors/commentGraphs';
import { createGraphCommentRequest, setGraphCommentParent } from '../../../store/actions/commentGraphs';

const AddComment = ({ graph, closeModal, isReply }) => {
  const dispatch = useDispatch();
  const myAccount = useSelector(getAccount);
  const parent = useSelector(getGraphCommentParent);
  const [text, setText] = useState('');

  return (
    <div className={`comment-modal__add-comment-section${isReply ? '--reply' : ''}`}>
      <Owner user={myAccount.myAccount} />
      <Input
        textArea
        value={text}
        onChangeText={(value) => setText(value)}
        className="comment-modal__add-comment-input"
        id={isReply ? 'reply-comment' : 'add-comment'}
      />
      <div className="comment-modal__add-comment-buttons">
        <Button
          className="comment-modal__add-comment-cancel"
          onClick={() => {
            if (parent.id) {
              dispatch(setGraphCommentParent({}));
            } else {
              closeModal();
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            dispatch(createGraphCommentRequest(
              {
                graphId: graph.id,
                text,
                parentId: parent.id,
              },
            ));
            setText('');
            dispatch(setGraphCommentParent({}));
          }}
          className="comment-modal__add-comment-button"
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

AddComment.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  isReply: PropTypes.bool,
};

AddComment.defaultProps = {
  isReply: false,
};

export default AddComment;
