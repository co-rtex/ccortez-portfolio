

public class BinarySearchTree_Placeholder<T extends Comparable<T>> implements SortedCollection<T> {

    protected BinaryNode<T> root; // reference to root node of tree, null when empty

    public BinarySearchTree_Placeholder() {
        this.root = null;
    }

    public void insert(T data) throws NullPointerException {
    }

    protected void insertHelper(BinaryNode<T> newNode, BinaryNode<T> subTree) throws NullPointerException {
    }

    public int size() {
        if (this.root == null)
            return 0;
        else
            return 1;
    }

    public boolean isEmpty() {
        return this.root == null;
    }

    public boolean contains(Comparable<T> data) throws NullPointerException {
        return false;
    }

    public void clear() {
    }

}