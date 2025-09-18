public class BinarySearchTree<T extends Comparable<T>> implements SortedCollection<T> {

    protected BinaryNode<T> root = null;

    public BinarySearchTree() {
    }

    @Override
    public void insert(T data) throws NullPointerException {
        if (data == null)
            throw new NullPointerException("BST does not allow null values.");
        BinaryNode<T> newNode = new BinaryNode<>(data);
        if (root == null) {
            root = newNode;
            return;
        }
        insertHelper(newNode, root);
    }

    @Override
    public boolean contains(Comparable<T> data) throws NullPointerException {
        if (data == null)
            throw new NullPointerException("contains() cannot search for null.");
        return containsHelper(data, root);
    }

    @Override
    public int size() {
        return sizeHelper(root);
    }

    @Override
    public boolean isEmpty() {
        return root == null;
    }

    @Override
    public void clear() {
        root = null;
    }

    protected void insertHelper(BinaryNode<T> newNode, BinaryNode<T> subtree) {
        if (subtree == null || newNode == null)
            return;
        int cmp = newNode.getData().compareTo(subtree.getData());
        if (cmp <= 0) {
            if (subtree.getLeft() == null) {
                subtree.setLeft(newNode);
                newNode.setParent(subtree);
            } else {
                insertHelper(newNode, subtree.getLeft());
            }
        } else {
            if (subtree.getRight() == null) {
                subtree.setRight(newNode);
                newNode.setParent(subtree);
            } else {
                insertHelper(newNode, subtree.getRight());
            }
        }
    }

    private boolean containsHelper(Comparable<T> data, BinaryNode<T> node) {
        if (node == null)
            return false;
        int cmp = data.compareTo(node.getData());
        if (cmp == 0)
            return true;
        return (cmp < 0) ? containsHelper(data, node.getLeft())
                : containsHelper(data, node.getRight());
    }

    private int sizeHelper(BinaryNode<T> node) {
        if (node == null)
            return 0;
        return 1 + sizeHelper(node.getLeft()) + sizeHelper(node.getRight());
    }

    public boolean test1() {
        try {
            BinarySearchTree<Integer> bst = new BinarySearchTree<>();
            int[] vals = { 8, 3, 10, 1, 6, 14, 4, 7, 13 };
            for (int v : vals)
                bst.insert(v);

            if (bst.isEmpty())
                return false;
            if (bst.size() != vals.length)
                return false;

            if (!bst.contains(8))
                return false;
            if (!bst.contains(1))
                return false;
            if (!bst.contains(14))
                return false;
            if (bst.contains(99))
                return false;

            String got = bst.root.toLevelOrderString();
            String exp = "[ 8, 3, 10, 1, 6, 14, 4, 7, 13 ]";
            return exp.equals(got);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean test2() {
        try {
            BinarySearchTree<String> bst = new BinarySearchTree<>();
            String[] vals = { "m", "c", "t", "a", "e", "m" };
            for (String s : vals)
                bst.insert(s);

            if (bst.size() != 6)
                return false;
            if (!bst.contains("m") || !bst.contains("e"))
                return false;
            if (bst.contains("z"))
                return false;

            String inorder = bst.root.toInOrderString();
            if (!"[ a, c, e, m, m, t ]".equals(inorder))
                return false;

            String level = bst.root.toLevelOrderString();
            return "[ m, c, t, a, e, m ]".equals(level);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean test3() {
        try {
            BinarySearchTree<Integer> bst = new BinarySearchTree<>();
            int[] first = { 2, 1, 3, 2 };
            for (int v : first)
                bst.insert(v);

            if (bst.size() != 4)
                return false;
            if (!bst.contains(2) || !bst.contains(1) || !bst.contains(3))
                return false;

            bst.clear();
            if (!bst.isEmpty())
                return false;
            if (bst.size() != 0)
                return false;

            int[] second = { 5, 4, 6 };
            for (int v : second)
                bst.insert(v);
            if (bst.isEmpty())
                return false;
            if (bst.size() != 3)
                return false;
            if (!bst.contains(5) || !bst.contains(4) || !bst.contains(6))
                return false;

            return "[ 5, 4, 6 ]".equals(bst.root.toLevelOrderString());
        } catch (Exception e) {
            return false;
        }
    }

    public static void main(String[] args) {
        BinarySearchTree<Integer> runner = new BinarySearchTree<>();
        boolean r1 = runner.test1();
        boolean r2 = runner.test2();
        boolean r3 = runner.test3();

        System.out.println("test1 (Integers - shape & contains): " + (r1 ? "PASS" : "FAIL"));
        System.out.println("test2 (Strings  - duplicates & order): " + (r2 ? "PASS" : "FAIL"));
        System.out.println("test3 (Size & Clear across builds): " + (r3 ? "PASS" : "FAIL"));
    }
}
